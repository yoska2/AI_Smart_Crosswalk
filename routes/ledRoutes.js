import express from 'express';
import { createLed, fetchAllLeds } from '../services/ledService.js';
import fs from 'fs';

const router = express.Router();

const rawData = fs.readFileSync('./dummy-data.json');
const dummyData = JSON.parse(rawData);

// POST /api/leds - Create new LED via service
router.post('/', async (req, res) => {
    try {
        const savedLed = await createLed(req.body);
        res.status(201).json(savedLed);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/leds - Get all LEDs, optionally filtered by ?crosswalkId=cw_001
router.get('/', async (req, res) => {
    try {
        const { crosswalkId } = req.query;
        const leds = crosswalkId
            ? dummyData.leds.filter((l) => l.crosswalkId === crosswalkId)
            : dummyData.leds;
        res.json(leds);
        //Temporarily commented out real DB fetch
        // const leds = await fetchAllLeds();
        // res.json(leds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
