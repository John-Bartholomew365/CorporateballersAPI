const express = require('express');
const router = express.Router();
const authentication = require('../middlewares/auth');
const { register, login, forgotPassword, resetPassword, changePassword } = require('../controllers/authCtrl');
const { getProfile, updateProfile } = require('../controllers/profileCtrl');
const upload = require('../middlewares/upload');

// @route   POST /api/auth/register
router.post('/register',register);

// @route   POST /api/auth/login
router.post('/login',login);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password',forgotPassword);

// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token',resetPassword);

// @route   PUT /api/auth/change-password
router.patch('/change-password', authentication,changePassword);

// @route Get /api/auth/profile
router.get('/profile', authentication, getProfile);

// @route   GET /api/auth/profile-update
router.patch('/profile-update', authentication, upload.single('profilePicture'), updateProfile);

module.exports = router;
