"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Apply authGuard to all analytics endpoints
router.use(authMiddleware_1.authGuard);
router.get('/overview', analyticsController_1.getOverviewAnalytics);
router.get('/link/:linkId', analyticsController_1.getLinkAnalytics);
exports.default = router;
