"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const linkRoutes_1 = __importDefault(require("./routes/linkRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const redirectController_1 = require("./controllers/redirectController");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const errorHandler_1 = require("./middlewares/errorHandler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Set up security headers. Allow inline styles and script images for QR codes and UI transitions if required.
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Turned off for easy local integration/development or configure custom as needed
}));
// Enable Cross-Origin Resource Sharing
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
// Express parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Apply API rate limiting (100 reqs/min) to all /api/ endpoints to prevent abuse.
// Note: We bypass this limiter on redirects (/:shortCode) to maximize routing performance.
app.use('/api', rateLimiter_1.rateLimiter);
// API Endpoints
app.use('/api/auth', authRoutes_1.default);
app.use('/api/links', linkRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
// Wildcard redirection endpoint - intercepts non-API paths (e.g. /my-alias)
// Must be registered LAST so it doesn't intercept API routes
app.get('/:shortCode', redirectController_1.redirectUrl);
// Global exception handling
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    // 1. Establish database connections
    await (0, db_1.connectDB)();
    // 2. Connect to caching server
    await (0, redis_1.connectRedis)();
    // 3. Bind port
    app.listen(PORT, () => {
        console.log(`[Server]: Prime Links backend is running on http://localhost:${PORT}`);
    });
};
startServer();
