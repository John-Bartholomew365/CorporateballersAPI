require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
// Route imports

const app = express();
const PORT = process.env.PORT;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Assuming you have admin routes in authRoutes, otherwise import adminRoutes separately

// Base route
app.get('/', (req, res) => {
    res.send('Corporate Ballerz API is running');
});


// Database connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Use the HTTP server to listen, not the Express app
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    app.close(() => {
        process.exit(1);
    });
});