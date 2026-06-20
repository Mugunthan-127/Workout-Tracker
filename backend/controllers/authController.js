const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
        message: "User registered successfully",
        user: { id: user._id, name: user.name, email: user.email }
    });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.status(200).json({
        message: "Login successful",
        token,
        user: { id: user._id, name: user.name, email: user.email }
    });
});

exports.getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        message: "User details retrieved",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }
    });
});

exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        message: "User deleted successfully",
        user: { id: user._id, name: user.name, email: user.email }
    });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password");

    res.status(200).json({
        message: "All users retrieved",
        totalUsers: users.length,
        users: users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }))
    });
});
