require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Authentication Middleware
const authentication = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Fix: map decoded.id to _id so Mongoose can use it
        req.user = {
            userId: decoded.userId, // Ensure this matches your token payload
            role: decoded.role
        };

        // console.log("REQ.USER:", req.user);
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Role-based Authorization Middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = {
    authentication,
    restrictTo
};
