const express = require('express');
const { restrictTo, authentication } = require('../middlewares/auth');
const { rejectPlayer, verifyPlayer, getDashboardStats, getAllPlayers, createTrainingSession, updateTrainingSession, deleteTrainingSession, createTournament, updateTournamentStatus, getAllTournamentsWithStats, getAllTrainingSessions } = require('../controllers/adminCtrl');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(authentication);
router.use(restrictTo('Admin'));

// Admin routes
router.get('/players', getAllPlayers);
router.get('/tournaments', getAllTournamentsWithStats);
router.get('/training-sessions', getAllTrainingSessions);
router.get('/dashboard',getDashboardStats);
router.patch('/players/:userId/verify', verifyPlayer);
router.delete('/players/:userId/reject',rejectPlayer);
router.post('/create-session', createTrainingSession);
router.patch('/update-session/:id', updateTrainingSession);
router.delete('/delete-session/:id', deleteTrainingSession);
router.patch('/update/:id/status', updateTournamentStatus);
router.post('/create-tournament', createTournament);

module.exports = router;