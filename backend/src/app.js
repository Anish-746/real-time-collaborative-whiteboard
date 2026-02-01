import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { testConnection } from "./database/index.js";

const app = express();

// Test Supabase connection on startup
testConnection();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true}))
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
import userRouter from "./routes/user.routes.js"

app.use("/api/auth", userRouter)

export { app }