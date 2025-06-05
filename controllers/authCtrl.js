const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const FRONTEND_URL = 'https://yourfrontend.com'; // for reset links

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
            playerID: newId
        });

        await user.save();
        res.status(201).json({ statusCode:"00",message: 'Registration successful', user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            playerID:newId,
            role: user.role,
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

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

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

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save();

        const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

        // Replace with your real SMTP config
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'youremail@example.com',
                pass: 'yourpassword'
            }
        });

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 10 minutes.</p>`
        });

        res.status(200).json({ statusCode: "00", message: 'Reset link sent to email' });

    } catch (err) {
        res.status(500).json({ statusCode: "01", message: 'Server error', error: err.message });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ statusCode:"00", message: 'Password has been reset successfully' });

    } catch (err) {
        res.status(500).json({ statusCode: "01", message: 'Server error', error: err.message });
    }
};

// Change Password (logged-in users)
const changePassword = async (req, res) => {
    try {
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

        res.status(200).json({ statusCode:"00",message: 'Password changed successfully' });

    } catch (err) {
        res.status(500).json({statusCode:"01",message: 'Server error', error: err.message });
    }
};

// Export all functions
module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    changePassword
};
