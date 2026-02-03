const express = require('express');
const {
  register,
  login,
  googleLogin,
  logout,
  getMe,
  updateDetails,
  updatePassword
  // Note: forgotPassword, resetPassword, and verifyEmail are not implemented in supabaseAuthController
  // as Supabase handles these differently
} = require('../controllers/supabaseAuthController');
const { auth } = require('../middleware/supabaseAuth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/updatedetails', auth, updateDetails);
router.put('/updatepassword', auth, updatePassword);
// Note: Password reset and email verification are handled by Supabase
// router.post('/forgotpassword', forgotPassword);
// router.put('/resetpassword/:resettoken', resetPassword);
// router.get('/verify/:token', verifyEmail);

module.exports = router;