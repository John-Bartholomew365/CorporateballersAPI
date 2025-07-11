const { default: mongoose } = require("mongoose");

const settingsSchema = new mongoose.Schema({
    academyName: String,
    rcNumber: String,
    address: String,
    email: String,
    primaryPhone: String,
    missionStatement: String,

    trainingSettings: {
        maxPlayersPerSession: Number,
        sessionDurationHours: Number,
        minimumAttendance: Number
    },

    notifications: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        tournamentUpdates: { type: Boolean, default: false },
        attendanceAlerts: { type: Boolean, default: false }
    },

    securitySettings: {
        twoFactorAuth: { type: Boolean, default: false },
        sessionTimeout: { type: Number, default: 15 } // e.g. 15 minutes
    }
});

module.exports = mongoose.model('Settings', settingsSchema);