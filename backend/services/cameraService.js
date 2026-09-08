// PROVENANCE: [RACHE] your service.
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache).
 * ============================================================ */

/**
 * services/cameraService.js
 * -------------------------
 * Handles cameras: create a camera, get all cameras,
 * and get cameras for a specific crosswalk.
 */

import Camera from '../models/camera.js';

// Create and save a new camera document.
export const createCamera = async (cameraData) => {
    const newCamera = new Camera(cameraData);
    return await newCamera.save();
};

// Return every camera in the DB.
export const fetchAllCameras = async () => {
    return await Camera.find();
};

// Return only the cameras that belong to a given crosswalk.
export const fetchCamerasByCrosswalk = async (crosswalkId) => {
    return await Camera.find({ crosswalkId });
};

// Update a camera by its code (the `id` field, e.g. "cam_101") - NOT Mongo's _id.
// Partial update; also refreshes lastUpdated. Returns null if not found.
export const updateCamera = async (id, updates) => {
    return await Camera.findOneAndUpdate(
        { id },
        { ...updates, lastUpdated: Date.now() },
        { new: true, runValidators: true }
    );
};
