import { body } from 'express-validator';

export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// Room validation
export const createRoomValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters')
    .trim(),
  
  body('accessType')
    .optional()
    .isIn(['public', 'private', 'protected'])
    .withMessage('Access type must be public, private, or protected'),
  
  body('password')
    .optional()
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long'),
  
  body('maxUsers')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Max users must be between 2 and 100'),
  
  body('document')
    .optional()
    .isString()
    .withMessage('Document must be a base64 encoded string')
];

export const joinRoomValidation = [
  body('shortCode')
    .isLength({ min: 1, max: 10 })
    .withMessage('Short code is required')
    .trim()
    .toUpperCase(),
  
  body('password')
    .optional()
    .isString()
    .withMessage('Password must be a string')
];

export const updateRoomValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters')
    .trim(),
  
  body('accessType')
    .optional()
    .isIn(['public', 'private', 'protected'])
    .withMessage('Access type must be public, private, or protected'),
  
  body('maxUsers')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Max users must be between 2 and 100'),
  
  body('document')
    .optional()
    .isString()
    .withMessage('Document must be a base64 encoded string')
];

export const updateRoomDocumentValidation = [
  body('document')
    .notEmpty()
    .withMessage('Document is required')
    .isString()
    .withMessage('Document must be a base64 encoded string')
];