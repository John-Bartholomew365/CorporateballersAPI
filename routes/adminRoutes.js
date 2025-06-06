const express = require('express');
const { restrictTo, authentication } = require('../middlewares/auth');
const { rejectPlayer, verifyPlayer, getDashboardStats, getAllPlayers } = require('../controllers/adminCtrl');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(authentication);
router.use(restrictTo('Admin'));

// Admin routes
router.get('/players', getAllPlayers);
router.get('/dashboard',getDashboardStats);
router.patch('/players/:userId/verify', verifyPlayer);
router.delete('/players/:userId/reject',rejectPlayer);

module.exports = router; 