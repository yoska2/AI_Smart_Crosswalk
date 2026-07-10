/*
========================================
Main entry point of the application.

Responsibilities:
- Load environment variables.
- Connect to the database.
- Configure middleware.
- Register application routes.
- Start the server.
========================================
*/

import express from "express";
import dotenv from "dotenv";

// Database configuration
import connectDB from "./config/db.js";

// YOLOv8 detection service (spawns the long-lived Python process)
import yoloService from "./services/yoloService.js";

// Routes
import alertRoutes from "./routes/alertRoutes.js";
import crosswalkRoutes from "./routes/crosswalkRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import detectRoutes from "./routes/detectRoutes.js";

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Connect to MongoDB
connectDB();

// Start the persistent Python process once, at server boot,
// instead of spawning it again on every /detect request.
yoloService.startYoloService();

// Parse incoming JSON requests
app.use(express.json());

/*
========================================
Application Routes
========================================
*/

// User routes
app.use("/api/users", userRoutes);

// Alert routes
app.use("/api/alerts", alertRoutes);

// Crosswalk routes
app.use("/api/crosswalks", crosswalkRoutes);

// Detection routes (YOLOv8)
app.use("/detect", detectRoutes);

/*
========================================
Server Startup
========================================
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);

});