import { Router } from "express";

const router = Router()

// Basic health check route for testing
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

// Placeholder routes (to be implemented)
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

export default router;