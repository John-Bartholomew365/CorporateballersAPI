const User = require("../models/user");
const catchAsync = require("../utilis/catchAsync");

const getProfile = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password -confirmPassword');

    if (!user) {
        return res.status(404).json({ statusCode: "01", message: 'User not found' });
    }

    res.status(200).json({ statusCode: "00", message: 'Profile retrieved successfully', user });
});

const updateProfile = catchAsync(async (req, res) => {
    const userId = req.user.userId;

    const { bio, jerseyNumber, age, height, weight } = req.body;

    const updates = {
        ...(bio && { bio }),
        ...(jerseyNumber && { jerseyNumber }),
        ...(age && { age }),
        ...(height && { height }),
        ...(weight && { weight }),
    };

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
});

module.exports = {
    getProfile,
    updateProfile
};
