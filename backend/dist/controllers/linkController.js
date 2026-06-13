"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLink = exports.updateLink = exports.getLinkById = exports.getLinks = exports.createLink = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qrcode_1 = __importDefault(require("qrcode"));
const Link_1 = require("../models/Link");
const redis_1 = require("../config/redis");
// Utility to generate a collision-safe short code
const generateShortCode = (length = 6) => {
    // Generates random bytes, converts to base64, cleans non-alphanumeric chars
    return crypto_1.default
        .randomBytes(length)
        .toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, length);
};
const createLink = async (req, res) => {
    try {
        const { originalUrl, customAlias } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized. User ID not found.' });
            return;
        }
        let shortCode = '';
        if (customAlias) {
            const aliasLower = customAlias.trim();
            // Check if alias is already taken as shortCode or customAlias
            const existingLink = await Link_1.Link.findOne({
                $or: [{ shortCode: aliasLower }, { customAlias: aliasLower }],
            });
            if (existingLink) {
                res.status(400).json({ message: 'Custom alias is already in use.' });
                return;
            }
            shortCode = aliasLower;
        }
        else {
            let unique = false;
            while (!unique) {
                const potentialCode = generateShortCode();
                const existingLink = await Link_1.Link.findOne({
                    $or: [{ shortCode: potentialCode }, { customAlias: potentialCode }],
                });
                if (!existingLink) {
                    shortCode = potentialCode;
                    unique = true;
                }
            }
        }
        // Construct the actual redirect URL pointing to the backend redirect path
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.protocol;
        const shortUrl = `${protocol}://${host}/${shortCode}`;
        // Generate QR code data URI
        const qrCodeDataUri = await qrcode_1.default.toDataURL(shortUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300,
        });
        const newLink = new Link_1.Link({
            userId,
            originalUrl,
            shortCode,
            customAlias: customAlias ? shortCode : undefined,
            qrCode: qrCodeDataUri,
            clicks: 0,
        });
        await newLink.save();
        // Cache the redirection mapping in Redis for 24 hours
        // Cache payload holds both the target URL and DB document ID for async tracking
        const cachePayload = JSON.stringify({
            id: newLink._id,
            originalUrl: newLink.originalUrl,
        });
        if (redis_1.redisClient.isOpen) {
            await redis_1.redisClient.setEx(`link:${shortCode}`, 86400, cachePayload);
        }
        res.status(201).json({
            success: true,
            link: newLink,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error creating short URL.' });
    }
};
exports.createLink = createLink;
const getLinks = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const search = req.query.search;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        let query = { userId };
        if (search) {
            query.$or = [
                { originalUrl: { $regex: search, $options: 'i' } },
                { shortCode: { $regex: search, $options: 'i' } },
                { customAlias: { $regex: search, $options: 'i' } },
            ];
        }
        // Sort by newest links first
        const links = await Link_1.Link.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            links,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching links.' });
    }
};
exports.getLinks = getLinks;
const getLinkById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const link = await Link_1.Link.findOne({ _id: id, userId });
        if (!link) {
            res.status(404).json({ message: 'Link not found or unauthorized.' });
            return;
        }
        res.status(200).json({
            success: true,
            link,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching link details.' });
    }
};
exports.getLinkById = getLinkById;
const updateLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { originalUrl } = req.body;
        const userId = req.user?.userId;
        const link = await Link_1.Link.findOne({ _id: id, userId });
        if (!link) {
            res.status(404).json({ message: 'Link not found or unauthorized.' });
            return;
        }
        // Invalidate old cache key
        if (redis_1.redisClient.isOpen) {
            await redis_1.redisClient.del(`link:${link.shortCode}`);
        }
        link.originalUrl = originalUrl;
        await link.save();
        // Cache updated link mapping in Redis
        const cachePayload = JSON.stringify({
            id: link._id,
            originalUrl: link.originalUrl,
        });
        if (redis_1.redisClient.isOpen) {
            await redis_1.redisClient.setEx(`link:${link.shortCode}`, 86400, cachePayload);
        }
        res.status(200).json({
            success: true,
            link,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error updating link.' });
    }
};
exports.updateLink = updateLink;
const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const link = await Link_1.Link.findOne({ _id: id, userId });
        if (!link) {
            res.status(404).json({ message: 'Link not found or unauthorized.' });
            return;
        }
        // Remove from Redis
        if (redis_1.redisClient.isOpen) {
            await redis_1.redisClient.del(`link:${link.shortCode}`);
        }
        // Delete link from MongoDB (triggers cascade or is standard delete)
        await Link_1.Link.deleteOne({ _id: id });
        res.status(200).json({
            success: true,
            message: 'Link successfully deleted.',
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error deleting link.' });
    }
};
exports.deleteLink = deleteLink;
