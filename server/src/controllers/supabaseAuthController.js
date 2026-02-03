const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../utils/logger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token for internal use
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);
  
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.user_metadata.full_name || user.user_metadata.name,
        email: user.email,
        avatar: user.user_metadata.avatar_url || user.user_metadata.picture,
        subscription: user.subscription || { tier: 'free', status: 'active' },
        features: user.features || {
          max_file_size: 10485760, // 10MB
          concurrent_jobs: 1,
          batch_processing: false,
          custom_workflows: false,
          priority_processing: false,
          offline_access: false,
          api_access: false
        },
        usage: user.usage || {
          files_processed: 0,
          storage_used: 0,
          monthly_quota: 100,
          last_reset: new Date()
        }
      }
    });
};

// @desc    Register user with Supabase Auth
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists in Supabase Auth
    const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser && !userError) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for now
      user_metadata: {
        full_name: name,
      }
    });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    const user = data.user;

    // Insert user profile into custom profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        email: user.email,
        full_name: name,
        subscription: { tier: 'free', status: 'active' },
        usage: {
          files_processed: 0,
          storage_used: 0,
          monthly_quota: 100,
          last_reset: new Date()
        },
        features: {
          max_file_size: 10485760, // 10MB
          concurrent_jobs: 1,
          batch_processing: false,
          custom_workflows: false,
          priority_processing: false,
          offline_access: false,
          api_access: false
        }
      }])
      .select()
      .single();

    if (profileError) {
      logger.error('Profile creation error:', profileError);
      return res.status(500).json({
        status: 'error',
        message: 'Error creating user profile'
      });
    }

    sendTokenResponse({ ...user, ...profileData }, 201, res);
  } catch (err) {
    logger.error('Registration error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Login user with Supabase Auth
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an email and password'
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const user = data.user;

    // Fetch user profile from custom profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('Profile fetch error:', profileError);
      return res.status(500).json({
        status: 'error',
        message: 'Error fetching user profile'
      });
    }

    // Update last login in profile
    await supabase
      .from('profiles')
      .update({ 
        last_login: new Date().toISOString(),
        login_count: (profileData.login_count || 0) + 1
      })
      .eq('id', user.id);

    // Combine user data with profile data
    const userData = {
      ...user,
      ...profileData
    };

    sendTokenResponse(userData, 200, res);
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Google OAuth login with Supabase
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists in Supabase Auth
    let { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);

    if (!user || userError) {
      // Create new user in Supabase Auth
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          avatar_url: picture,
          google_id: googleId
        }
      });

      if (createUserError) {
        return res.status(400).json({
          status: 'error',
          message: 'Google authentication failed'
        });
      }

      user = newUser.user;

      // Create profile for the new user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          full_name: name,
          avatar_url: picture,
          google_id: googleId,
          email_verified: true,
          subscription: { tier: 'free', status: 'active' },
          usage: {
            files_processed: 0,
            storage_used: 0,
            monthly_quota: 100,
            last_reset: new Date()
          },
          features: {
            max_file_size: 10485760, // 10MB
            concurrent_jobs: 1,
            batch_processing: false,
            custom_workflows: false,
            priority_processing: false,
            offline_access: false,
            api_access: false
          }
        }])
        .select()
        .single();

      if (profileError) {
        logger.error('Profile creation error:', profileError);
      }
    } else {
      // Update existing user metadata
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          full_name: name,
          avatar_url: picture,
          google_id: googleId
        }
      });

      // Update profile if exists
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          avatar_url: picture,
          email_verified: true
        })
        .eq('id', user.id);

      if (updateProfileError) {
        logger.error('Profile update error:', updateProfileError);
      }
    }

    // Sign in the user to get session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: 'temp-supabase-password' // This won't be used for social auth but needed for session
    });

    if (signInError) {
      // For Google auth, we'll create a custom sign-in flow
      // In practice, you'd use Supabase's built-in Google OAuth or custom auth
      logger.warn('Sign-in error, using fallback:', signInError.message);
    }

    // Fetch updated profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const userData = {
      ...user,
      ...profileData
    };

    // Update last login
    await supabase
      .from('profiles')
      .update({ 
        last_login: new Date().toISOString(),
        login_count: (profileData.login_count || 0) + 1
      })
      .eq('id', user.id);

    sendTokenResponse(userData, 200, res);
  } catch (err) {
    logger.error('Google login error:', err);
    res.status(400).json({
      status: 'error',
      message: 'Google authentication failed'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    logger.error('Logout error:', error);
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Get user ID from the authenticated request (assumes middleware sets req.user)
    const userId = req.user.id;

    // Fetch user profile from custom profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(500).json({
        status: 'error',
        message: 'Error fetching user profile'
      });
    }

    // Fetch recent processing history
    const { data: historyData, error: historyError } = await supabase
      .from('processing_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: profileData.id,
          name: profileData.full_name,
          email: profileData.email,
          avatar: profileData.avatar_url,
          subscription: profileData.subscription,
          features: profileData.features,
          usage: profileData.usage,
          processingHistory: historyData || [],
          savedWorkflows: profileData.saved_workflows_count || 0
        }
      }
    });
  } catch (err) {
    logger.error('Get me error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Update user in Supabase Auth
    const { data: updatedUser, error: userError } = await supabase.auth.admin.updateUserById(userId, {
      email,
      user_metadata: {
        ...req.user.user_metadata,
        full_name: name
      }
    });

    if (userError) {
      return res.status(400).json({
        status: 'error',
        message: userError.message
      });
    }

    // Update profile in custom table
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        email
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      return res.status(500).json({
        status: 'error',
        message: profileError.message
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedProfile.id,
          name: updatedProfile.full_name,
          email: updatedProfile.email,
          avatar: updatedProfile.avatar_url
        }
      }
    });
  } catch (err) {
    logger.error('Update details error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // For Supabase, we need to verify the current password first
    // This requires the user's email which we can get from the token
    const userEmail = req.user.email;

    // First, try to sign in with current password to verify it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    });

    if (signInError) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(400).json({
        status: 'error',
        message: updateError.message
      });
    }

    // Return success with new token
    // Fetch updated user data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({
        status: 'error',
        message: profileError.message
      });
    }

    const userData = {
      ...req.user,
      ...profileData
    };

    sendTokenResponse(userData, 200, res);
  } catch (err) {
    logger.error('Update password error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};