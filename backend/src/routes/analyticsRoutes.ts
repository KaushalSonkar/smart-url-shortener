import { Router } from 'express';
import { getOverviewAnalytics, getLinkAnalytics } from '../controllers/analyticsController';
import { authGuard } from '../middlewares/authMiddleware';

const router = Router();

// Apply authGuard to all analytics endpoints
router.use(authGuard);

router.get('/overview', getOverviewAnalytics);
router.get('/link/:linkId', getLinkAnalytics);

export default router;
