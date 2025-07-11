const Tournament = require("../models/tournament");
const TrainingSession = require("../models/training");
const catchAsync = require("../utilis/catchAsync");


const getTrainingSessions = catchAsync(async (req, res) => {
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

const getTournamentsWithStats = catchAsync(async (req, res) => {
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


module.exports = {
    getTrainingSessions,
    getTournamentsWithStats
}