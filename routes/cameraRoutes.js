/**
 * routes/cameraRoutes.js
 * ----------------------
 * HTTP endpoints for cameras (mounted at /api/cameras).
 *   POST /                  -> create a camera
 *   GET  /?crosswalkId=cw_1 -> list cameras from the DB, optionally filtered
 */
import express from 'express';
import {
    createCamera,
    fetchAllCameras,
    fetchCamerasByCrosswalk,
} from '../services/cameraService.js';

const router = express.Router();

// POST /api/cameras - create a new camera.
router.post('/', async (req, res) => {
    try {
        const savedCamera = await createCamera(req.body);
        res.status(201).json(savedCamera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/cameras - return cameras from the DB, optionally filtered by ?crosswalkId.
router.get('/', async (req, res) => {
    try {
        const { crosswalkId } = req.query;
        const cameras = crosswalkId
            ? await fetchCamerasByCrosswalk(crosswalkId)
            : await fetchAllCameras();
        res.json(cameras);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
