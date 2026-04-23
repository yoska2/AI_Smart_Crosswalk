import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the URI from .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Log the error and exit the process if connection fails
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;