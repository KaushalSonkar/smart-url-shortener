import { Router } from 'express';
import { createLink, getLinks, getLinkById, updateLink, deleteLink } from '../controllers/linkController';
import { authGuard } from '../middlewares/authMiddleware';
import { validateLink } from '../middlewares/validationMiddleware';

const router = Router();

// Apply authGuard to all link management routes
router.use(authGuard);

router.post('/', validateLink, createLink);
router.get('/', getLinks);
router.get('/:id', getLinkById);
router.put('/:id', validateLink, updateLink);
router.delete('/:id', deleteLink);

export default router;
