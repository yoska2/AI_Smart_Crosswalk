import express from 'express';
import { createAlert, fetchAllAlerts } from '../services/alertService.js';
import fs from 'fs';

const router = express.Router();

const rawData = fs.readFileSync('./dummy-data.json'); 
const dummyData = JSON.parse(rawData);

// POST /api/alerts - Create new alert via service
router.post('/', async (req, res) => {
    try {
        const savedAlert = await createAlert(req.body);
        res.status(201).json(savedAlert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/alerts - Get all alerts via service
router.get('/', async (req, res) => {
    try {

        res.json(dummyData.alerts);
        //Temporarily commented out real DB fetch
        // const alerts = await fetchAllAlerts();
       // res.json(alerts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;