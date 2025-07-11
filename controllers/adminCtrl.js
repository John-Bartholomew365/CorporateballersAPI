const attendance = require("../models/attendance");
const playerPerformance = require("../models/playerPerformance");
const settings = require("../models/settings");
const Tournament = require("../models/tournament");
const TrainingSession = require("../models/training");
const User = require("../models/user");
const catchAsync = require("../utilis/catchAsync");
const sendEmail = require("../utilis/nodemailer");

const verifyPlayer = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isVerified: true },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user) {
        return('No user found with that ID', 404);
    }

    user.verificationStatus = 'Approved';
    await user.save();


    // Send Email after marking as verified
    await sendEmail({
        email: user.email,
        subject: 'CBFA Registration Status',
        message: `Dear ${user.firstName},\n\nCongratulations! Your CBFA registration has been approved.\n\nRegards,\nCBFA Team`
    });

    res.status(200).json({
        statusCode: "00",
        message: 'User verified successfully',
        data: {
            user,
        },
    });
});

const rejectPlayer = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        return res.status(404).json({
            statusCode: "01",
            message: 'No user found with that ID',
        });
    }

    // Optionally store rejection reason or status
    user.verificationStatus = 'Rejected'; // Or use `isRejected = true`
    await user.save();

    // Send email after marking as rejected
    await sendEmail({
        email: user.email,
        subject: 'CBFA Registration Status',
        message: `Dear ${user.firstName},\n\nWe regret to inform you that your CBFA registration has been rejected.\n\nRegards,\nCBFA Team`
    });

    res.status(200).json({
        statusCode: "00",
        message: 'User rejected and notified via email',
    });
});

const getAllPlayers = catchAsync(async (req, res, next) => {
    const players = await User.find({ role: 'User' }).select(
        'firstName lastName age category preferredPosition status playerID profilePicture verificationStatus'
    );

    if (!players || players.length === 0) {
        return res.status(404).json({
            statusCode: "01",
            message: 'No players found',
        });
    }

    const totalPlayers = players.length;
    const seniorCount = players.filter(p => p.category === 'Senior').length;
    const juniorCount = players.filter(p => p.category === 'Junior').length;
    const activePlayers = players.filter(p => p.status === 'Active').length;
    
    // console.log(players)
    res.status(200).json({
        statusCode: "00",
        message: 'Players retrieved successfully',
        totalPlayers,
        seniorCount,
        juniorCount,
        activePlayers,
        players: players.map(player => ({
            id: player._id,
            fullName: `${player.firstName} ${player.lastName}`,
            age: player.age,
            category: player.category,
            position: player.preferredPosition,
            status: player.status,
            playerId: player.playerID,
            profilePicture: player.profilePicture, // for initials/avatar display
            attendance: Math.floor(Math.random() * (96 - 85 + 1) + 85), // mock attendance
            verificationStatus: player.verificationStatus // include verification status
        }))
    });
});

const getDashboardStats = catchAsync(async (req, res, next) => {
    const totalPlayers = await User.countDocuments({ role: 'User' });
    const verifiedPlayers = await User.countDocuments({ role: 'User', isVerified: true , verificationStatus: 'Approved' });
    const unverifiedPlayers = await User.countDocuments({ role: 'User', isVerified: false, verificationStatus: 'Pending' });
    const rejectedPlayers = await User.countDocuments({ role: 'User', isVerified: false, verificationStatus: 'Rejected' });

    res.status(200).json({
        statusCode: "00",
        message: 'Dashboard statistics retrieved successfully',
        data: {
            totalPlayers,
            verifiedPlayers,
            unverifiedPlayers,
            rejectedPlayers,
        },
    });
});

const createTrainingSession = catchAsync(async (req, res) => {
  
    const {
        day,
        time,
        duration,
        category,
        coach,
        trainingType,
        location,
        description
    } = req.body;

    const newSession = new TrainingSession({
        day,
        time,
        duration,
        category,
        coach,
        trainingType,
        location,
        description,
        createdBy: req.user.userId
    });

    await newSession.save();

    res.status(201).json({
        statusCode: '00',
        message: 'Training session created successfully',
        data: newSession
    });
});

const getAllTrainingSessions = catchAsync(async (req, res) => {
    const sessions = await TrainingSession.find().sort({ createdAt: -1 });  
    if (!sessions || sessions.length === 0) {
        return res.status(404).json({
            statusCode: '01',
            message: 'No training sessions found'
        });
    }
    res.status(200).json({
        statusCode: '00',
        message: 'Training sessions retrieved successfully',
        data: sessions.map(session => ({
            id: session._id,
            day: session.day,
            time: session.time,
            duration: session.duration,
            category: session.category,
            coach: session.coach,
            trainingType: session.trainingType,
            location: session.location,
            description: session.description,
            createdBy: session.createdBy,
            createdAt: session.createdAt
        }))
    });
});

const updateTrainingSession = catchAsync(async (req, res) => {
    const sessionId = req.params.id;

    const updatedSession = await TrainingSession.findByIdAndUpdate(
        sessionId,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedSession) {
        return res.status(404).json({ message: 'Training session not found' });
    }

    res.status(200).json({
        statusCode: '00',
        message: 'Training session updated successfully',
        data: updatedSession
    });
});

const deleteTrainingSession = catchAsync(async (req, res) => {
    const sessionId = req.params.id;

    const deletedSession = await TrainingSession.findByIdAndDelete(sessionId);

    if (!deletedSession) {
        return res.status(404).json({ message: 'Training session not found' });
    }

    res.status(200).json({
        statusCode: '00',
        message: 'Training session deleted successfully'
    });
});

const createTournament = catchAsync(async (req, res) => {
    const {
        name,
        location,
        startDate,
        endDate,
        registrationDeadline,
        category,
        maxTeams,
        description
    } = req.body;

    const tournament = new Tournament({
        name,
        location,
        startDate,
        endDate,
        registrationDeadline,
        category,
        maxTeams,
        description,
        createdBy: req.user._id
    });

    await tournament.save();

    res.status(201).json({
        statusCode: '00',
        message: 'Tournament created successfully',
        data: tournament
    });
});

const updateTournamentStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
    }

    tournament.status = status;
    tournament.updatedAt = Date.now();

    await tournament.save();

    res.status(200).json({
        statusCode: '00',
        message: `Tournament marked as ${status}`,
        data: tournament
    });
});

const getAllTournamentsWithStats = catchAsync(async (req, res) => {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });

    const total = tournaments.length;

    const statusStats = tournaments.reduce(
        (acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        },
        {
            Upcoming: 0,
            Ongoing: 0,
            Completed: 0,
            Cancelled: 0,
        }
    );

    res.status(200).json({
        statusCode: '00',
        message: 'Tournaments fetched successfully',
        data: {
            total,
            statusStats,
            tournaments
        }
    });
});

const updatePlayerPerformance = catchAsync(async (req, res) => {
    const { userId, playerName, skills, statistics } = req.body;

    const updated = await playerPerformance.findOneAndUpdate(
        { user:userId },
        { playerName, skills, statistics },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
        statusCode: '00',
        message: 'Player performance updated successfully',
        data: updated
    });
});

const addAchievement = catchAsync(async (req, res) => {
    const { userId, title, description, accolade, date } = req.body;

    const performance = await playerPerformance.findOneAndUpdate(
        { user:userId },
        {
            $push: {
                achievements: {
                    title,
                    description,
                    accolade,
                    date
                }
            }
        },
        { new: true }
    );


    if (!performance) {
        return res.status(404).json({
            statusCode: '01',
            message: 'Player performance record not found'
        });
    }

    res.status(200).json({
        statusCode: '00',
        message: 'Achievement added successfully',
        data: performance
    });
});

const getPlayerPerformance = catchAsync(async (req, res) => {
    const { userId } = req.params;

    const performance = await playerPerformance.findOne({ user: userId });

    if (!performance) {
        return res.status(404).json({
            statusCode: '01',
            message: 'Performance data not found for player'
        });
    }

    res.status(200).json({
        statusCode: '00',
        message: 'Player performance data retrieved',
        data: performance
    });
});

const deleteAchievement = catchAsync(async (req, res) => {
    const { achievementId } = req.params;

    // Find the document that contains this achievement
    const performance = await playerPerformance.findOneAndUpdate(
        { 'achievements._id': achievementId },
        { $pull: { achievements: { _id: achievementId } } },
        { new: true }
    );

    if (!performance) {
        return res.status(404).json({
            statusCode: '01',
            message: 'Achievement not found'
        });
    }

    res.status(200).json({
        statusCode: '00',
        message: 'Achievement removed successfully',
        data: performance
    });
});

const markAttendance = catchAsync(async (req, res) => {
    const { userId, date, session, present } = req.body;

    const record = await attendance.findOneAndUpdate(
        { user: userId, date, session },
        { present },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
        statusCode: '00',
        message: 'Attendance marked successfully',
        data: record
    });
});

const markAllPresent = catchAsync(async (req, res) => {
    const { date, session, userIds } = req.body;

    const bulkOps = userIds.map(userId => ({
        updateOne: {
            filter: { user: userId, date, session },
            update: { present: true },
            upsert: true
        }
    }));

    await attendance.bulkWrite(bulkOps);

    res.status(200).json({
        statusCode: '00',
        message: 'All players marked present'
    });
});

const getDailyAttendance = catchAsync(async (req, res) => {
    const { date, session } = req.query;

    const records = await attendance.find({ date, session }).populate('user', 'firstName lastName category playerId');

    res.status(200).json({
        statusCode: '00',
        data: records
    });
});

const getWeeklyOverview = catchAsync(async (req, res) => {
    const { weekStart, weekEnd } = req.query;

    const overview = await attendance.aggregate([
        {
            $match: {
                date: {
                    $gte: new Date(weekStart),
                    $lte: new Date(weekEnd)
                }
            }
        },
        {
            $group: {
                _id: { date: '$date', session: '$session' },
                total: { $sum: 1 },
                present: { $sum: { $cond: ['$present', 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$present', false] }, 1, 0] } }
            }
        },
        {
            $project: {
                _id: 0,
                date: '$_id.date',
                session: '$_id.session',
                total: '$total',
                present: '$present',
                absent:'$absent',
                attendanceRate: {
                    $cond: [
                        { $gt: ['$total', 0] },
                        { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2] },
                        0
                    ]
                }
            }
        },
        { $sort: { date: 1 } }
    ]);

    res.status(200).json({
        statusCode: '00',
        data: overview
    });
});

const updateSettings = catchAsync(async (req, res) => {
    const updates = req.body;

    const updateSet = await settings.findOneAndUpdate({}, updates, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    });

    res.status(200).json({
        statusCode: '00',
        message: 'Settings updated successfully',
        data: updateSet
    });
});

const getSettings = catchAsync(async (req, res) => {
    const getSetting = await settings.findOne();

    res.status(200).json({
        statusCode: '00',
        message: 'Academy settings retrieved successfully',
        data: getSetting
    });
});








module.exports = {
    verifyPlayer,
    rejectPlayer,
    getAllPlayers,
    getDashboardStats,
    createTrainingSession,
    updateTrainingSession,
    deleteTrainingSession,
    createTournament,
    updateTournamentStatus,
    getAllTournamentsWithStats,
    getAllTrainingSessions,
    updatePlayerPerformance,
    addAchievement,
    getPlayerPerformance,
    deleteAchievement,
    markAttendance,
    markAllPresent,
    getDailyAttendance,
    getWeeklyOverview,
    updateSettings,
    getSettings
};

