import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Import the connection function
import alertRoutes from './routes/alertRoutes.js';
import crosswalkRoutes from './routes/crosswalkRoutes.js';
import cameraRoutes from './routes/cameraRoutes.js';
import ledRoutes from './routes/ledRoutes.js';
import { initSocket, watchAlerts } from './config/socket.js';

dotenv.config();
const app = express();

// Wrap Express in an HTTP server so Socket.io can share the same port.
const server = http.createServer(app);

// Initialize Socket.io before we start listening for DB changes.
initSocket(server);

// Connect to the Database, then start the live change-stream feed.
connectDB().then(() => {
    watchAlerts();
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // base64 snapshots can exceed the default 100kb limit

app.use('/api/alerts', alertRoutes);
app.use('/api/crosswalks', crosswalkRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/leds', ledRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
