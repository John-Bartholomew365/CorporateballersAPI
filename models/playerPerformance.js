const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    ballControl: { type: Number, default: 0 },        // %
    passingAccuracy: { type: Number, default: 0 },    // %
    shooting: { type: Number, default: 0 },
    defending: { type: Number, default: 0 },
    physical_fitness: { type: Number, default: 0 },
    team_work: { type: Number, default: 0 }           // %
});

const statsSchema = new mongoose.Schema({
    rating: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 }
});

const achievementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    accolade: {
        type: String,
        enum: ['award', 'attendance', 'performance', 'leadership'],
        required: true
    },
    date: { type: Date, default: Date.now }
});

const playerPerformanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    playerName: {
        type: String,
        required: true
    },
    skills: skillSchema,
    statistics: statsSchema,
    achievements: [achievementSchema]
});

module.exports = mongoose.model('PlayerPerformance', playerPerformanceSchema);
