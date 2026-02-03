const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * User-related database operations
 */
class UserDB {
  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`User not found: ${err.message}`);
    }
  }

  /**
   * Find user by email
   */
  static async findOneByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error finding user: ${err.message}`);
    }
  }

  /**
   * Create a new user profile
   */
  static async create(userData) {
    try {
      // Hash the password if provided
      let hashedPassword = null;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 12);
      }

      // Insert user into profiles table
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userData.id,
          email: userData.email,
          full_name: userData.name,
          avatar_url: userData.avatar || 'default.jpg',
          subscription: {
            tier: 'free',
            status: 'active',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            current_period_end: null,
            trial_ends_at: null
          },
          usage: {
            files_processed: 0,
            storage_used: 0,
            monthly_quota: 100,
            last_reset: new Date().toISOString()
          },
          features: {
            max_file_size: 10485760, // 10MB
            concurrent_jobs: 1,
            batch_processing: false,
            custom_workflows: false,
            priority_processing: false,
            offline_access: false,
            api_access: false
          },
          email_verified: userData.email_verified || false,
          google_id: userData.google_id || null,
          last_login: new Date().toISOString(),
          login_count: 1
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error creating user: ${err.message}`);
    }
  }

  /**
   * Update user profile
   */
  static async updateById(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error updating user: ${err.message}`);
    }
  }

  /**
   * Compare password
   */
  static async comparePassword(inputPassword, storedPasswordHash) {
    return await bcrypt.compare(inputPassword, storedPasswordHash);
  }

  /**
   * Create password reset token
   */
  static createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return { resetToken, hashedToken, expires };
  }

  /**
   * Create verification token
   */
  static createVerificationToken() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    return { verificationToken, hashedToken };
  }

  /**
   * Check if user has feature access
   */
  static hasFeatureAccess(user, featureName) {
    return user.features[featureName] === true;
  }

  /**
   * Check if user can process file based on size
   */
  static canProcessFile(user, fileSize) {
    return fileSize <= user.features.max_file_size;
  }

  /**
   * Check if user has quota available
   */
  static hasQuotaAvailable(user) {
    const now = new Date();
    const userLastReset = new Date(user.usage.last_reset);
    
    // Reset quota if month has passed
    if (now.getMonth() !== userLastReset.getMonth() || 
        now.getFullYear() !== userLastReset.getFullYear()) {
      user.usage.files_processed = 0;
      user.usage.last_reset = now.toISOString();
    }
    
    const quotas = {
      free: 100,
      pro: 1000,
      business: 5000,
      enterprise: Infinity
    };
    
    const currentQuota = quotas[user.subscription.tier] || quotas.free;
    return user.usage.files_processed < currentQuota;
  }

  /**
   * Increment user usage
   */
  static incrementUsage(user, fileSize = 0) {
    user.usage.files_processed += 1;
    user.usage.storage_used += fileSize;
    return user;
  }
}

/**
 * Processing History-related database operations
 */
class ProcessingHistoryDB {
  /**
   * Create processing history record
   */
  static async create(historyData) {
    try {
      const { data, error } = await supabase
        .from('processing_history')
        .insert([{
          user_id: historyData.userId,
          operation: historyData.operation,
          original_files: historyData.originalFiles || [],
          result_file: historyData.resultFile,
          processing_time: historyData.processingTime,
          start_time: historyData.startTime,
          end_time: historyData.endTime,
          status: historyData.status || 'completed',
          error: historyData.error,
          performance_metrics: historyData.performanceMetrics,
          is_batch_operation: historyData.isBatchOperation || false,
          size_reduction: historyData.sizeReduction
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error creating processing history: ${err.message}`);
    }
  }

  /**
   * Find processing history by user ID
   */
  static async findByUserId(userId, options = {}) {
    try {
      let query = supabase
        .from('processing_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (options.operation) {
        query = query.eq('operation', options.operation);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }

      // Apply pagination if provided
      if (options.limit) {
        query = query.limit(options.limit);
        if (options.offset) {
          query = query.range(options.offset, options.offset + options.limit - 1);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error finding processing history: ${err.message}`);
    }
  }

  /**
   * Find processing history by ID and user ID
   */
  static async findByIdAndUserId(id, userId) {
    try {
      const { data, error } = await supabase
        .from('processing_history')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error finding processing history: ${err.message}`);
    }
  }

  /**
   * Delete processing history by ID and user ID
   */
  static async deleteByIdAndUserId(id, userId) {
    try {
      const { error } = await supabase
        .from('processing_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      throw new Error(`Error deleting processing history: ${err.message}`);
    }
  }

  /**
   * Get user statistics for the last N days
   */
  static async getUserStats(userId, days = 30) {
    try {
      const { data, error } = await supabase
        .from('processing_history')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error getting user stats: ${err.message}`);
    }
  }

  /**
   * Get daily statistics for the last N days
   */
  static async getDailyStats(userId, days = 30) {
    try {
      // For PostgreSQL, we'd use a more complex query
      // For now, we'll get the raw data and process it in JS
      const { data, error } = await supabase
        .from('processing_history')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Process the data to group by day
      const dailyStats = {};
      data.forEach(item => {
        const date = new Date(item.created_at).toDateString();
        if (!dailyStats[date]) {
          dailyStats[date] = [];
        }
        dailyStats[date].push(item);
      });

      return dailyStats;
    } catch (err) {
      throw new Error(`Error getting daily stats: ${err.message}`);
    }
  }

  /**
   * Check if operation is a batch operation
   */
  static isBatchOperation(historyItem) {
    return historyItem.original_files && historyItem.original_files.length > 1;
  }

  /**
   * Get performance metrics
   */
  static getPerformanceMetrics(historyItem) {
    return historyItem.performance_metrics || {};
  }
}

/**
 * Workflow-related database operations
 */
class WorkflowDB {
  /**
   * Create workflow
   */
  static async create(workflowData) {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert([{
          user_id: workflowData.userId,
          name: workflowData.name,
          description: workflowData.description,
          steps: workflowData.steps,
          is_public: workflowData.isPublic || false
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error creating workflow: ${err.message}`);
    }
  }

  /**
   * Find workflows by user ID
   */
  static async findByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error finding workflows: ${err.message}`);
    }
  }
}

/**
 * Subscription-related database operations
 */
class SubscriptionDB {
  /**
   * Create subscription
   */
  static async create(subscriptionData) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: subscriptionData.userId,
          tier: subscriptionData.tier,
          status: subscriptionData.status,
          stripe_customer_id: subscriptionData.stripeCustomerId,
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          current_period_start: subscriptionData.currentPeriodStart,
          current_period_end: subscriptionData.currentPeriodEnd,
          trial_ends_at: subscriptionData.trialEndsAt
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error creating subscription: ${err.message}`);
    }
  }

  /**
   * Update subscription by user ID
   */
  static async updateByUserId(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      throw new Error(`Error updating subscription: ${err.message}`);
    }
  }
}

module.exports = {
  UserDB,
  ProcessingHistoryDB,
  WorkflowDB,
  SubscriptionDB
};