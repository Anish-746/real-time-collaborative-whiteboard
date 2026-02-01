import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  refreshToken, 
  getCurrentUser, 
  logoutUser,
  updateProfile
} from '../controllers/index.js';
import { authenticate } from '../middleware/index.js';
import { 
  registerValidation, 
  loginValidation, 
  refreshTokenValidation 
} from '../middleware/validation.js';
import { validateRequest } from '../middleware/index.js';

const router = Router();

// Public routes
router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);
router.post('/refresh-token', refreshTokenValidation, validateRequest, refreshToken);

// Protected routes
router.get('/profile', authenticate, getCurrentUser);
router.post('/logout', authenticate, logoutUser);
router.put('/profile', authenticate, updateProfile);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;