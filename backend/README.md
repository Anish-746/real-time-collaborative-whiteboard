# Real-time Collaborative Whiteboard - Backend

A Node.js Express server providing JWT authentication and real-time collaboration features for the whiteboard application.

## Tech Stack
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.IO
- **Validation**: Express Validator

## Project Structure

### Root Files
- **`.env`** - Environment variables (database credentials, JWT secrets, etc.)
- **`.env.example`** - Template for environment variables
- **`.gitignore`** - Git ignore patterns for Node.js projects
- **`package.json`** - Node.js dependencies and scripts
- **`supabase-schema.sql`** - PostgreSQL database schema for users and sessions

### Source Directory (`src/`)

#### Main Application Files
- **`index.js`** - Server entry point, starts Express app on specified port
- **`app.js`** - Express application setup, middleware configuration, route mounting, and error handling
- **`app-old.js`** - Previous version of app.js (backup)

#### Configuration (`config/`)
- **`index.js`** - Central configuration management (Supabase credentials, JWT settings, CORS origins)

#### Controllers (`controllers/`)
- **`index.js`** - Authentication controllers (register, login, logout, refresh token, user profile management)

#### Database (`database/`)
- **`index.js`** - Supabase client initialization and database connection testing

#### Middleware (`middleware/`)
- **`index.js`** - Authentication middleware (JWT token verification, protected route handling)
- **`validation.js`** - Input validation rules using express-validator (register, login, token validation)

#### Models (`models/`)
- **`user.models.js`** - User model with CRUD operations using Supabase client
- **`index.js`** - Models barrel file (currently empty)

#### Routes (`routes/`)
- **`auth.routes.js`** - Authentication routes (/register, /login, /logout, /profile, /refresh-token)
- **`user.routes.js`** - User management routes (additional user operations)

#### Services (`services/`)
- **`index.js`** - Business logic services (currently empty, ready for future features)

#### Utils (`utils/`)
- **`ApiError.js`** - Custom error class for consistent API error handling
- **`ApiResponse.js`** - Standardized API response wrapper
- **`Asynchandler.js`** - Async function wrapper for Express route error handling
- **`jwt.js`** - JWT token generation, verification, and refresh logic

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration with validation
- `POST /login` - User authentication
- `POST /logout` - User logout (protected)
- `GET /profile` - Get current user profile (protected)
- `POST /refresh-token` - Refresh JWT access token
- `PUT /profile` - Update user profile (protected)
- `GET /health` - Auth service health check

### General Routes
- `GET /api/health` - Main API health check

## Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Database Schema
The application uses PostgreSQL through Supabase with the following main tables:
- **users** - User account information
- **user_sessions** - JWT refresh token management

## Security Features
- JWT-based authentication with access/refresh token pair
- Password hashing using bcryptjs
- Input validation and sanitization
- CORS protection
- Environment variable management
- Custom error handling with proper HTTP status codes

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Start development server: `npm run dev`
5. API will be available at `http://localhost:5000`