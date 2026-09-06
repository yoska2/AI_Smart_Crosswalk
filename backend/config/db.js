// PROVENANCE: [MERGE] your db.js + Yossef's public-DNS workaround.
/* ============================================================
 * SANDBOX FILE - SETTLED. MERGED: your db.js + Yossef's public-DNS workaround.
 * ============================================================ */

/**
 * config/db.js
 * ------------
 * Connects the app to MongoDB (Atlas) using the URI from .env.
 * Forces public DNS servers to avoid SRV-lookup failures on some networks
 * (fixes the Atlas "querySrv ENOTFOUND" error). Exits the process on failure
 * so we fail fast instead of running with no database.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js to use public DNS servers (fixes Atlas "ENOTFOUND" on some networks).
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables (MONGO_URI, etc.)
dotenv.config();

const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the URI from .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Log the error and stop the process if the connection fails
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
