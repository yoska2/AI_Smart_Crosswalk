import express from 'express';
import { createCrosswalk, fetchAllCrosswalks } from '../services/crosswalkService.js';
import fs from 'fs';

const router = express.Router();

const rawData = fs.readFileSync('./dummy-data.json'); 
const dummyData = JSON.parse(rawData);

router.post('/', async (req, res) => {
    try {
        const savedCrosswalk = await createCrosswalk(req.body);
        res.status(201).json(savedCrosswalk);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    console.log("Data from JSON file: ", dummyData.crosswalks);
    try {
        res.json(dummyData.crosswalks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;