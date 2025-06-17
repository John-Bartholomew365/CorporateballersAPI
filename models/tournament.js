const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tournament name is required'],
        trim: true,
        maxlength: [100, 'Tournament name cannot exceed 100 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: 'Start date must be in the future'
        }
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    registrationDeadline: {
        type: Date,
        required: [true, 'Registration deadline is required'],
        validate: {
            validator: function (value) {
                return value < this.startDate;
            },
            message: 'Registration deadline must be before start date'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Junior', 'Senior', 'Both'],
            message: 'Please select a valid category'
        }
    },
    maxTeams: {
        type: Number,
        required: [true, 'Maximum teams is required'],
        min: [1, 'There must be at least 1 team'],
        max: [64, 'Maximum teams cannot exceed 16']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
tournamentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create a text index for searching
tournamentSchema.index({
    name: 'text',
    location: 'text',
    description: 'text'
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;