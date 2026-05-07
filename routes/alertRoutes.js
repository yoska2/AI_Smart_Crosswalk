import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

// Create a new alert
router.post('/', async (req, res) => {
    try {
        const newAlert = new Alert(req.body);
        const savedAlert = await newAlert.save();
        res.status(201).json(savedAlert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;

// Get all alerts with full details
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('crosswalkId') // Pulls the crosswalk data
            .populate('deviceId');    // Pulls the camera data
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});