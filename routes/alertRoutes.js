/**
 * routes/alertRoutes.js
 * ---------------------
 * HTTP endpoints for alerts (mounted at /api/alerts).
 *   POST /  -> create a new alert (used by the AI node)
 *   GET  /  -> list all alerts from the database (newest first)
 */
import express from 'express';
import { createAlert, fetchAllAlerts } from '../services/alertService.js';

const router = express.Router();

// POST /api/alerts - create a new alert via the service (uploads image + saves).
router.post('/', async (req, res) => {
    try {
        const savedAlert = await createAlert(req.body);
        res.status(201).json(savedAlert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/alerts - return all alerts from the real database.
router.get('/', async (req, res) => {
    try {
        const alerts = await fetchAllAlerts();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
