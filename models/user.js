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
    jerseyNumber: { type: Number, required: true, min: 1, max: 99 },
    age: { type: Number, required: true },
    height: { type: String, required: true }, // e.g., "6'0"
    weight: { type: String, required: true }, // e.g., "180 lbs" 

    // Emergency Contact
    emergencyContact: {
        contactName: { type: String, required: true },
        contactPhone: { type: String, required: true },
        relationship: { type: String, required: true }
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

    // User Role
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User',
    },
    // Timestamp
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
