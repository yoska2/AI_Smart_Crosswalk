// PROVENANCE: [RACHE] your code, unchanged.
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache).
 * ============================================================ */

/**
 * config/cloudinary.js
 * --------------------
 * Configures the Cloudinary SDK with the credentials from .env.
 * (The upload logic lives in services/cloudinaryService.js.)
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Credentials come from .env (never commit them).
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
