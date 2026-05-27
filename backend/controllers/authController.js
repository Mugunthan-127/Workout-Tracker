const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

/* Register Controller */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        /* Validation */
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        /* Check if user already exists */
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        /* Hash password */
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        /* Create new user */
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword 
        });
        await user.save();

        res.status(201).json({ 
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Login Controller */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        /* Validation */
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        /* Find user */
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        /* Compare password */
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        /* Generate JWT token */
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get User Details (Protected Route) */
exports.getUser = async (req, res) => {
    try {
        const userId = req.userId;

        /* Find user by ID */
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Delete User (Protected Route) */
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.userId;

        /* Find and delete user */
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            message: "User deleted successfully",
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* Get All Users (Development Only) */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        // select("-password") = Don't show passwords

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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
