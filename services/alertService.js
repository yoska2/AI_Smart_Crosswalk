import Alert from '../models/alert.js';

// Logic to save a new alert to DB
export const createAlert = async (alertData) => {
    const newAlert = new Alert(alertData);
    return await newAlert.save();
};

// Logic to fetch all alerts
export const fetchAllAlerts = async () => {
    return await Alert.find().sort({ timestamp: -1 });
};