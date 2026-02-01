import { verifyToken } from '../utils/jwt.js';
import { UserModel } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from '../utils/Asynchandler.js';
import { validationResult } from 'express-validator';

// JWT Authentication Middleware
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    throw new ApiError(401, 'Access token is required');
  }
  
  try {
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      throw new ApiError(401, 'Invalid token type');
    }
    
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    
    if (!user.is_active) {
      throw new ApiError(401, 'User account is deactivated');
    }
    
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

// Optional Authentication (for routes that work with/without auth)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      if (user && user.is_active) {
        req.user = user;
      }
    } catch (error) {
      // Continue without authentication
    }
  }
  
  next();
});

// Validation Middleware
export const validateRequest = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }
  next();
});