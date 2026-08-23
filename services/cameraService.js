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
