"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const generateToken = (userId, email) => {
    const secret = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction123!';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    return jsonwebtoken_1.default.sign({ userId, email }, secret, { expiresIn });
};
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists.' });
            return;
        }
        const user = new User_1.User({ name, email, password });
        await user.save();
        const token = generateToken(user._id.toString(), user.email);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error occurred during registration.' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid email or password.' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid email or password.' });
            return;
        }
        const token = generateToken(user._id.toString(), user.email);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error occurred during login.' });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    // JWT is stateless; client removes token. Just send confirmation
    res.status(200).json({
        success: true,
        message: 'User logged out successfully.',
    });
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized profile request.' });
            return;
        }
        const user = await User_1.User.findById(req.user.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error occurred retrieving profile.' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized profile request.' });
            return;
        }
        const { name, currentPassword, newPassword } = req.body;
        const user = await User_1.User.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        if (name) {
            if (typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ message: 'Name must be a valid string.' });
                return;
            }
            user.name = name.trim();
        }
        if (newPassword) {
            if (!currentPassword) {
                res.status(400).json({ message: 'Current password is required to set a new password.' });
                return;
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                res.status(400).json({ message: 'Incorrect current password.' });
                return;
            }
            if (typeof newPassword !== 'string' || newPassword.length < 6) {
                res.status(400).json({ message: 'New password must be at least 6 characters long.' });
                return;
            }
            user.password = newPassword;
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error occurred updating profile.' });
    }
};
exports.updateProfile = updateProfile;
