import express from 'express';
import { createCamera, fetchAllCameras } from '../services/cameraService.js';
import fs from 'fs';

const router = express.Router();

const rawData = fs.readFileSync('./dummy-data.json');
const dummyData = JSON.parse(rawData);

// POST /api/cameras - Create new camera via service
router.post('/', async (req, res) => {
    try {
        const savedCamera = await createCamera(req.body);
        res.status(201).json(savedCamera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/cameras - Get all cameras, optionally filtered by ?crosswalkId=cw_001
router.get('/', async (req, res) => {
    try {
        const { crosswalkId } = req.query;
        const cameras = crosswalkId
            ? dummyData.cameras.filter((c) => c.crosswalkId === crosswalkId)
            : dummyData.cameras;
        res.json(cameras);
        //Temporarily commented out real DB fetch
        // const cameras = await fetchAllCameras();
        // res.json(cameras);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
