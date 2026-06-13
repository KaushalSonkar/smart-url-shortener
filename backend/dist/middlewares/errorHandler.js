"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error('Unhandled server error:', err.stack || err);
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'An unexpected error occurred on the server.';
    res.status(status).json({
        success: false,
        message,
        // Only expose stack trace in development mode
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
