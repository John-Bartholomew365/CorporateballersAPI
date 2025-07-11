const express = require('express');
const router = express.Router();
const { getTrainingSessions, getTournamentsWithStats } = require('../controllers/playersCtrl');
const { authentication, restrictTo } = require('../middlewares/auth');


router.use(authentication);
router.use(restrictTo('User'));
// @route Get /api/auth/profile
router.get('/training', authentication, getTrainingSessions);
router.get('/tournament', authentication, getTournamentsWithStats);


module.exports = router;
