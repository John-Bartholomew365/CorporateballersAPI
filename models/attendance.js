const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    session: {
        type: String, // e.g. "Tuesday 4:00 PM"
        required: true
    },
    present: {
        type: Boolean,
        required: true
    }
});

attendanceSchema.index({ user: 1, date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
