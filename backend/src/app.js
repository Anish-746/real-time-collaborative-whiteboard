import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { testConnection } from "./database/index.js";
import { config } from "./config/index.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

// Test Supabase connection on startup
testConnection();

app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Whiteboard API is running',
    timestamp: new Date().toISOString(),
    database: 'Supabase PostgreSQL'
  });
});

//import routes
import authRouter from "./routes/auth.routes.js"
import roomRouter from "./routes/room.routes.js"

app.use("/api/auth", authRouter)
app.use("/api/rooms", roomRouter)

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.error || null
    });
  }
  
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

export { app }