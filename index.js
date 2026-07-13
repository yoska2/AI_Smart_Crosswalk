import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Import the connection function
import alertRoutes from './routes/alertRoutes.js';
import crosswalkRoutes from './routes/crosswalkRoutes.js';
import cameraRoutes from './routes/cameraRoutes.js';
import ledRoutes from './routes/ledRoutes.js';

dotenv.config();
const app = express();

// Connect to the Database
connectDB();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/alerts', alertRoutes);
app.use('/api/crosswalks', crosswalkRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/leds', ledRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});