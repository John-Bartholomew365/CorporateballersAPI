const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const catchAsync = require('../utilis/catchAsync');
const sendEmail = require('../utilis/nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const FRONTEND_URL = process.env.FRONTEND_URL; // for reset links

// Register
const register = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phoneNumber, dateOfBirth,
            gender, address, category, preferredPosition, preferredFoot,
            footballExperience, emergencyContact, terms, password, confirmPassword
        } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate new Player ID
        const lastUser = await User.findOne().sort({ createdAt: -1 });
        let newId = 'CBFA001';

        if (lastUser && lastUser.playerID) {
            const lastIdNum = parseInt(lastUser.playerID.slice(4), 10);
            const nextIdNum = lastIdNum + 1;
            newId = `CBFA${nextIdNum.toString().padStart(3, '0')}`;
        }

        const user = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth,
            gender,
            address,
            category,
            preferredPosition,
            preferredFoot,
            footballExperience,
            emergencyContact,
            terms,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            playerID: newId,
            verificationStatus: 'Pending',
        });

        await user.save();

        res.status(201).json({
            statusCode: "00", message: 'Registration successful. Your account require approval by an administrator', user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            playerID:newId,
            role: user.role,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus
        } });

    } catch (err) {
        res.status(500).json({ statusCode: "01", message: 'Server error', error: err.message });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Check if user is verified (approved by admin)
        if (!user.isVerified || user.verificationStatus !== 'Approved') {
            if (user.verificationStatus === 'Rejected') {
                return res.status(400).json({ message: 'Your account has been rejected by an administrator' });
            }
            return res.status(400).json({message:'Your account is awaiting approval by an administrator'});
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '2d' });

        res.status(200).json({
            statusCode:"00",
            message: 'Login successful',
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (err) {
        res.status(500).json({statusCode:"01", message: 'Server error', error: err.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP before saving
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        user.resetPasswordToken = otpHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        console.log("Sending OTP to:", user.email);

        await sendEmail({
            to: user.email,
            subject: 'Your Password Reset OTP',
            message: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
        });

        res.status(200).json({ statusCode: "00", message: 'OTP sent to email' });

    } catch (err) {
        res.status(500).json({ statusCode: "01", message: 'Server error', error: err.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        // Hash the provided OTP to match the stored hashed token
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        // Find user with hashed OTP
        const user = await User.findOne({
            resetPasswordToken: otpHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        // Mark OTP as verified
        user.isOtpVerified = true;
        await user.save();

        res.status(200).json({
            statusCode: "00",
            message: "OTP verified. You can now reset your password.",
            user: {
                id: user._id,
            }
        });

    } catch (err) {
        res.status(500).json({ statusCode: "01", message: 'Server error', error: err.message });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { userId, password, confirmPassword } = req.body;

        if (!userId || !password || !confirmPassword)
            return res.status(400).json({ message: 'All fields are required' });

        if (password !== confirmPassword)
            return res.status(400).json({ message: 'Passwords do not match' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isOtpVerified)
            return res.status(403).json({ message: 'OTP verification required before password reset' });

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.isOtpVerified = false;

        await user.save();

        res.status(200).json({ statusCode: "00", message: 'Password reset successfully' });

    } catch (err) {
        res.status(500).json({ statusCode: "01", message: 'Server error', error: err.message });
    }
};
  

// Change Password (logged-in users)
const changePassword = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;

    await user.save();

    res.status(200).json({ statusCode: "00", message: 'Password changed successfully' });
});


// Export all functions
module.exports = {
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    changePassword
};
