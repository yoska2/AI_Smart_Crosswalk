import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js to use public DNS servers
dns.setServers(['8.8.8.8', '1.1.1.1']);

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