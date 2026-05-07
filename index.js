import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Import the connection function
import alertRoutes from './routes/alertRoutes.js';
import crosswalkRoutes from './routes/crosswalkRoutes.js'; // Import the new router

dotenv.config();
const app = express();

// Connect to the Database
connectDB();

const PORT = 5000;

app.use(express.json());
app.use('/api/alerts', alertRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use('/api/crosswalks', crosswalkRoutes); // Mount the router on this path