import Alert from '../models/alert.js';
import { uploadImage } from './cloudinaryService.js';

// Save a new alert. If a base64 image was sent, upload it to Cloudinary first
// and store only the returned URL in the DB.
export const createAlert = async (alertData) => {
    const { imageBase64, ...rest } = alertData;
    let imageUrl = rest.imageUrl;

    if (imageBase64) {
        imageUrl = await uploadImage(imageBase64);
    }

    const newAlert = new Alert({ ...rest, imageUrl });
    return await newAlert.save();
};

// Fetch all alerts (newest first).
export const fetchAllAlerts = async () => {
    return await Alert.find().sort({ timestamp: -1 });
};
