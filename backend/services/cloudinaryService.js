// PROVENANCE: [RACHE] your service.
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache).
 * ============================================================ */

import cloudinary from '../config/cloudinary.js';

/**
 * Upload a snapshot to Cloudinary and return its hosted URL.
 * Accepts either a full data URI ("data:image/jpeg;base64,...") or a bare
 * base64 string (we add the prefix if it is missing).
 */

export const uploadImage = async (image) => {
    const dataUri = image.startsWith('data:')
        ? image
        : `data:image/jpeg;base64,${image}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'crosswalk_alerts',
    });
    return result.secure_url;
};
