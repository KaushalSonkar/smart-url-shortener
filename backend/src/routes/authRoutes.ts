import { Router } from 'express';
import { register, login, logout, getProfile, updateProfile } from '../controllers/authController';
import { authGuard } from '../middlewares/authMiddleware';
import { validateRegister, validateLogin } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/profile', authGuard, getProfile);
router.put('/profile', authGuard, updateProfile);

export default router;
