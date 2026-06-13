"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const linkController_1 = require("../controllers/linkController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
// Apply authGuard to all link management routes
router.use(authMiddleware_1.authGuard);
router.post('/', validationMiddleware_1.validateLink, linkController_1.createLink);
router.get('/', linkController_1.getLinks);
router.get('/:id', linkController_1.getLinkById);
router.put('/:id', validationMiddleware_1.validateLink, linkController_1.updateLink);
router.delete('/:id', linkController_1.deleteLink);
exports.default = router;
