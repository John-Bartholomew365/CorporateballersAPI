// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Personal Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    address: { type: String, required: true },
    profilePicture: { type: String }, // Path to the profile picture
    bio: { type: String, maxlength: 500 },

    // Football Information
    playerID: { type: String, unique: true },
    category: { type: String,enum:['Junior', 'Senior'], required: true },
    preferredPosition: { type: String, enum:['Winger', 'Forward', 'Midfielder','Defender', 'GoalKeeper'], required: true },
    preferredFoot: { type: String, enum: ['Left', 'Right', 'Both'], required: true },
    footballExperience: {
        type: String,
        enum: ['Beginner', 'Amateur', 'Semi-Pro', 'Professional'],
        required: true
    },
    jerseyNumber: { type: Number, required: false, min: 1, max: 99 },
    age: { type: Number, required: false },
    height: { type: String, required: false }, // e.g., "6'0"
    weight: { type: String, required: false }, // e.g., "180 lbs" 

    // Emergency Contact
    emergencyContact: {
        contactName: { type: String, required: false },
        contactPhone: { type: String, required: false },
        relationship: { type: String, required: false }
    },

    // Additional Information
    terms:{
        type: Boolean,
        required: true,
        default: false
    },

    // Security
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    isOtpVerified: {
        type: Boolean,
        default: false
      },

    // User Role
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active',
    },
    achievements: [{
        title: { type: String, required: false },
        description: { type: String, required: false },
        date: { type: Date, default: Date.now }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Timestamp
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
