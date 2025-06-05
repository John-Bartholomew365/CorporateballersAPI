const User = require('../models/user');
const path = require('path');
const multer = require('multer');


const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming userId is stored in req.user by authentication middleware
        const user = await User.findById(userId).select('-password -confirmPassword'); // Exclude sensitive fields

        if (!user) {
            return res.status(404).json({ statusCode: "01", message: 'User not found' });
        }

        res.status(200).json({ statusCode: "00", message: 'Profile retrieved successfully', user });
    } catch (err) {
        res.status(500).json({ statusCode: "01", message: 'Server error', error: err.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { bio, jerseyNumber, age, height, weight } = req.body;

        const updates = {
            ...(bio && { bio }),
            ...(jerseyNumber && { jerseyNumber }),
            ...(age && { age }),
            ...(height && { height }),
            ...(weight && { weight }),
        };

        // If file was uploaded, add the path
        if (req.file) {
            const imagePath = `/uploads/profilePictures/${req.file.filename}`;
            updates.profilePicture = imagePath;
        }

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        }).select('-password -confirmPassword');

        if (!user) {
            return res.status(404).json({ statusCode: "01", message: 'User not found' });
        }

        res.status(200).json({
            statusCode: "00",
            message: 'Profile updated successfully',
            user
        });

    } catch (err) {
        res.status(500).json({
            statusCode: "01",
            message: 'Server error',
            error: err.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};