import express from 'express';
import Crosswalk from '../models/Crosswalk.js';

const router = express.Router();

// GET /api/crosswalks - Retrieve all crosswalks from DB
router.get('/', async (req, res) => {
    try {
        const crosswalks = await Crosswalk.find();
        res.json(crosswalks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

