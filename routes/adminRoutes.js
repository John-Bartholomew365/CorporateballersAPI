const express = require('express');
const { restrictTo, authentication } = require('../middlewares/auth');
const { rejectPlayer, verifyPlayer, getDashboardStats, getAllPlayers, createTrainingSession, updateTrainingSession, deleteTrainingSession, createTournament, 
    updateTournamentStatus, getAllTournamentsWithStats, getAllTrainingSessions, 
    updatePlayerPerformance, addAchievement, getPlayerPerformance, deleteAchievement, markAttendance,
    markAllPresent, getDailyAttendance, getWeeklyOverview, 
    updateSettings,
    getSettings} = require('../controllers/adminCtrl');

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
router.post('/add-achievement', addAchievement);
router.patch('/update-performance', updatePlayerPerformance);
router.get('/:userId/performance', getPlayerPerformance);
router.delete('/achievement/:achievementId', deleteAchievement)
router.post('/mark', markAttendance); // Mark one
router.post('/mark-all',markAllPresent); // Mark all present
router.get('/daily',getDailyAttendance); // Fetch daily
router.get('/weekly-overview', getWeeklyOverview); // Weekly summary
router.post('/settings-update', updateSettings)
router.get('/get-settings', getSettings)

module.exports = router;