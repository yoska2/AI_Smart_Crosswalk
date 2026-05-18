import express from 'express';
import { fetchAllCrosswalks } from '../services/crosswalkService.js';

const router = express.Router();

// GET /api/crosswalks - Get all crosswalks via service
router.get('/', async (req, res) => {
    try {
        const crosswalks = await fetchAllCrosswalks();
        res.json(crosswalks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;