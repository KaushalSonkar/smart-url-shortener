"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkAnalytics = exports.getOverviewAnalytics = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Link_1 = require("../models/Link");
const Analytics_1 = require("../models/Analytics");
const getOverviewAnalytics = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        // 1. Fetch user's links
        const userLinks = await Link_1.Link.find({ userId }).select('_id clicks');
        const totalLinks = userLinks.length;
        const totalClicks = userLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
        if (totalLinks === 0) {
            res.status(200).json({
                success: true,
                summary: { totalLinks: 0, totalClicks: 0 },
                devices: [],
                browsers: [],
                os: [],
                referrers: [],
                timeline: [],
            });
            return;
        }
        const linkIds = userLinks.map((link) => link._id);
        // 2. Aggregate device types
        const deviceAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: { $in: linkIds } } },
            { $group: { _id: '$device', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // 3. Aggregate browsers
        const browserAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: { $in: linkIds } } },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // 4. Aggregate operating systems
        const osAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: { $in: linkIds } } },
            { $group: { _id: '$operatingSystem', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // 5. Aggregate top referrers
        const referrerAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: { $in: linkIds } } },
            { $group: { _id: '$referrer', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        // 6. Aggregate timeline (last 7 days of clicks)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const timelineAgg = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    linkId: { $in: linkIds },
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    clicks: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.status(200).json({
            success: true,
            summary: {
                totalLinks,
                totalClicks,
            },
            devices: deviceAgg.map((item) => ({ name: item._id, value: item.count })),
            browsers: browserAgg.map((item) => ({ name: item._id, value: item.count })),
            os: osAgg.map((item) => ({ name: item._id, value: item.count })),
            referrers: referrerAgg.map((item) => ({ name: item._id, value: item.count })),
            timeline: timelineAgg.map((item) => ({ date: item._id, clicks: item.clicks })),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error compiling analytics overview.' });
    }
};
exports.getOverviewAnalytics = getOverviewAnalytics;
const getLinkAnalytics = async (req, res) => {
    try {
        const { linkId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(linkId)) {
            res.status(400).json({ message: 'Invalid Link ID.' });
            return;
        }
        // Verify ownership
        const link = await Link_1.Link.findOne({ _id: linkId, userId });
        if (!link) {
            res.status(404).json({ message: 'Link not found or unauthorized.' });
            return;
        }
        const oid = new mongoose_1.default.Types.ObjectId(linkId);
        // 1. Device split
        const deviceAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: oid } },
            { $group: { _id: '$device', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // 2. Browser split
        const browserAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: oid } },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // 3. OS split
        const osAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: oid } },
            { $group: { _id: '$operatingSystem', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // 4. Referrers
        const referrerAgg = await Analytics_1.Analytics.aggregate([
            { $match: { linkId: oid } },
            { $group: { _id: '$referrer', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        // 5. Timeline (last 30 days for individual link analytics)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        const timelineAgg = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    linkId: oid,
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    clicks: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.status(200).json({
            success: true,
            summary: {
                shortCode: link.shortCode,
                originalUrl: link.originalUrl,
                totalClicks: link.clicks,
                createdAt: link.createdAt,
            },
            devices: deviceAgg.map((item) => ({ name: item._id, value: item.count })),
            browsers: browserAgg.map((item) => ({ name: item._id, value: item.count })),
            os: osAgg.map((item) => ({ name: item._id, value: item.count })),
            referrers: referrerAgg.map((item) => ({ name: item._id, value: item.count })),
            timeline: timelineAgg.map((item) => ({ date: item._id, clicks: item.clicks })),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error compiling link analytics.' });
    }
};
exports.getLinkAnalytics = getLinkAnalytics;
