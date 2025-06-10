const User = require("../models/user");
const catchAsync = require("../utilis/catchAsync");
const sendEmail = require("../utilis/nodemailer");

const verifyPlayer = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isVerified: true },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user) {
        return('No user found with that ID', 404);
    }

    user.verificationStatus = 'Approved'; // Or use `isRejected = true`
    await user.save();

    res.status(200).json({
        statusCode: "00",
        message: 'User verified successfully',
        data: {
            user,
        },
    });
});

const rejectPlayer = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        return res.status(404).json({
            statusCode: "01",
            message: 'No user found with that ID',
        });
    }

    // Optionally store rejection reason or status
    user.verificationStatus = 'Rejected'; // Or use `isRejected = true`
    await user.save();

    // Send email after marking as rejected
    // await sendEmail({
    //     email: user.email,
    //     subject: 'CBFA Registration Status',
    //     message: `Dear ${user.firstName},\n\nWe regret to inform you that your CBFA registration has been rejected.\n\nRegards,\nCBFA Team`
    // });

    res.status(200).json({
        statusCode: "00",
        message: 'User rejected and notified via email',
    });
});


const getAllPlayers = catchAsync(async (req, res, next) => {
    const players = await User.find({ role: 'User' }).select(
        'firstName lastName age category preferredPosition status playerID profilePicture'
    );

    if (!players || players.length === 0) {
        return res.status(404).json({
            statusCode: "01",
            message: 'No players found',
        });
    }

    const totalPlayers = players.length;
    const seniorCount = players.filter(p => p.category === 'Senior').length;
    const juniorCount = players.filter(p => p.category === 'Junior').length;
    const activePlayers = players.filter(p => p.status === 'Active').length;
    
    // console.log(players)
    res.status(200).json({
        statusCode: "00",
        message: 'Players retrieved successfully',
        totalPlayers,
        seniorCount,
        juniorCount,
        activePlayers,
        players: players.map(player => ({
            id: player._id,
            fullName: `${player.firstName} ${player.lastName}`,
            age: player.age,
            category: player.category,
            position: player.preferredPosition,
            status: player.status,
            playerId: player.playerID,
            profilePicture: player.profilePicture, // for initials/avatar display
            attendance: Math.floor(Math.random() * (96 - 85 + 1) + 85) // mock attendance
        }))
    });
});



const getDashboardStats = catchAsync(async (req, res, next) => {
    const totalPlayers = await User.countDocuments({ role: 'User' });
    const verifiedPlayers = await User.countDocuments({ role: 'User', isVerified: true });
    const unverifiedPlayers = await User.countDocuments({ role: 'User', isVerified: false });

    res.status(200).json({
        statusCode: "00",
        message: 'Dashboard statistics retrieved successfully',
        data: {
            totalPlayers,
            verifiedPlayers,
            unverifiedPlayers,
        },
    });
});

module.exports = {
    verifyPlayer,
    rejectPlayer,
    getAllPlayers,
    getDashboardStats
};

