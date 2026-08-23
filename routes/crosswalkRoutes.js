/**
 * routes/crosswalkRoutes.js
 * -------------------------
 * HTTP endpoints for crosswalks (mounted at /api/crosswalks).
 *   POST /  -> create a crosswalk
 *   GET  /  -> list all crosswalks from the database
 */
import express from 'express';
import { createCrosswalk, fetchAllCrosswalks } from '../services/crosswalkService.js';

const router = express.Router();

// POST /api/crosswalks - create a new crosswalk.
router.post('/', async (req, res) => {
    try {
        const savedCrosswalk = await createCrosswalk(req.body);
        res.status(201).json(savedCrosswalk);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/crosswalks - return all crosswalks from the real database.
router.get('/', async (req, res) => {
    try {
        const crosswalks = await fetchAllCrosswalks();
        res.json(crosswalks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
