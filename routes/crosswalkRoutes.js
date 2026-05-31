/*
========================================
Routes responsible for crosswalk operations.

Protected routes require a valid JWT
token before accessing crosswalk data.
========================================
*/

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getAllCrosswalks
} from "../services/crosswalkService.js";

const router = express.Router();

router.get("/", authMiddleware, getAllCrosswalks);

export default router;