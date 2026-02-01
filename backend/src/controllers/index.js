import { UserModel } from '../models/user.models.js';
import { generateTokenPair, verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/Asynchandler.js';
import { supabase } from '../database/index.js';

// Register new user
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  // Check if user already exists
  const existingUserByEmail = await UserModel.findByEmail(email);
  if (existingUserByEmail) {
    throw new ApiError(409, 'User with this email already exists');
  }
  
  const existingUserByUsername = await UserModel.findByUsername(username);
  if (existingUserByUsername) {
    throw new ApiError(409, 'Username is already taken');
  }
  
  // Create new user
  const newUser = await UserModel.create({
    username,
    email,
    password,
    firstName,
    lastName
  });
  
  // Generate tokens
  const tokens = generateTokenPair(newUser.id);
  
  res.status(201).json(
    new ApiResponse(201, {
      user: newUser,
      ...tokens
    }, 'User registered successfully')
  );
});

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }
  
  if (!user.is_active) {
    throw new ApiError(401, 'Account is deactivated');
  }
  
  // Verify password
  const isPasswordValid = await UserModel.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }
  
  // Update last login
  await UserModel.updateLastLogin(user.id);
  
  // Generate tokens
  const tokens = generateTokenPair(user.id);
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  res.status(200).json(
    new ApiResponse(200, {
      user: userWithoutPassword,
      ...tokens
    }, 'Login successful')
  );
});

// Refresh access token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }
  
  try {
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new ApiError(401, 'Invalid token type');
    }
    
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.is_active) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    
    const tokens = generateTokenPair(user.id);
    
    res.status(200).json(
      new ApiResponse(200, tokens, 'Token refreshed successfully')
    );
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

// Get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  
  res.status(200).json(
    new ApiResponse(200, { user: userWithoutPassword }, 'User profile retrieved successfully')
  );
});

// Logout user (optional - mainly for client-side token clearing)
export const logoutUser = asyncHandler(async (req, res) => {
  // In a more advanced setup, you could blacklist the token here
  res.status(200).json(
    new ApiResponse(200, null, 'Logout successful')
  );
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, avatar } = req.body;
  const userId = req.user.id;
  
  // Update user profile in database
  const { data, error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      avatar: avatar
    })
    .eq('id', userId)
    .select('id, username, email, first_name, last_name, avatar, is_active, last_login, created_at, updated_at')
    .single();

  if (error) throw new ApiError(500, 'Failed to update profile');
  
  res.status(200).json(
    new ApiResponse(200, { user: data }, 'Profile updated successfully')
  );
});
