import express from 'express';
import connectDB from './config/db.js'; // Import the connection function

const app = express();

// Connect to the Database
connectDB();

const PORT = 5000;

app.get('/', (req, res) => {
    res.send('Hello Smart Crosswalk Project');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});