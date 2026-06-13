"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7', // combined RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    message: {
        success: false,
        message: 'Too many requests. Please wait a minute before trying again.',
    },
});
