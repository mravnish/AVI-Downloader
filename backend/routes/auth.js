'use strict';
const express = require('express');
const {
  sendOtp, verifyOtp, resendOtp,
  login, getMe, getAllUsers,
  updateProfile, countDownload,
} = require('../controllers/authController');

const router = express.Router();

router.post('/send-otp',       sendOtp);       // Step 1: send OTP to email
router.post('/verify-otp',     verifyOtp);     // Step 2: verify OTP → create account
router.post('/resend-otp',     resendOtp);     // Resend new OTP
router.post('/login',          login);         // Sign in
router.get ('/me',             getMe);         // Get current user (verify token)
router.get ('/users',          getAllUsers);   // Admin: get all users
router.patch('/profile',       updateProfile); // Update profile
router.post('/count-download', countDownload); // Increment download count

module.exports = router;
