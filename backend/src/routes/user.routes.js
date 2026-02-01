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


export default router;