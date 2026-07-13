import Camera from '../models/camera.js';

export const createCamera = async (cameraData) => {
    const newCamera = new Camera(cameraData);
    return await newCamera.save();
};

export const fetchAllCameras = async () => {
    return await Camera.find();
};

export const fetchCamerasByCrosswalk = async (crosswalkId) => {
    return await Camera.find({ crosswalkId });
};
