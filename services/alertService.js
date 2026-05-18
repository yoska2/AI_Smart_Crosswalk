import Alert from '../models/Alert.js';

// Logic to save a new alert to DB
export const createAlert = async (alertData) => {
    const newAlert = new Alert(alertData);
    return await newAlert.save();
};

// Logic to fetch all alerts with populated references
export const fetchAllAlerts = async () => {
    return await Alert.find()
        .populate('crosswalkId')
        .populate('deviceId');
};