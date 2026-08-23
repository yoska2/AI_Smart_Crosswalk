/**
 * index.js
 * --------
 * Application entry point for the Smart Crosswalk backend.
 * Responsibilities:
 *   1. Start an HTTP server that hosts both the REST API and Socket.io.
 *   2. Connect to MongoDB, then start the change-stream live feed.
 *   3. Mount the REST routes (alerts, crosswalks, cameras, leds, users).
 *
 * Data flow: AI node -> POST /api/alerts -> saved in DB -> change stream ->
 * Socket.io "newAlert" -> frontend updates live.
 */
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';                 // DB connection helper
import alertRoutes from './routes/alertRoutes.js';
import crosswalkRoutes from './routes/crosswalkRoutes.js';
import cameraRoutes from './routes/cameraRoutes.js';
import ledRoutes from './routes/ledRoutes.js';
import userRoutes from './routes/userRoutes.js';        // auth (from yosi-B1)
import { initSocket, watchAlerts } from './config/socket.js';

dotenv.config();
const app = express();

// Wrap Express in an HTTP server so Socket.io can share the same port.
const server = http.createServer(app);

// Initialize Socket.io before we start listening for DB changes.
initSocket(server);

// Connect to the database, then start the live change-stream feed.
connectDB().then(() => {
    watchAlerts();
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());                          // allow the frontend (any origin in dev) to call us
app.use(express.json({ limit: '10mb' })); // parse JSON bodies; 10mb so base64 images fit

// REST routes
app.use('/api/alerts', alertRoutes);
app.use('/api/crosswalks', crosswalkRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/leds', ledRoutes);
app.use('/api/users', userRoutes);        // register + login

// Start listening
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
