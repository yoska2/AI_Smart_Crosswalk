/*
========================================
Routes responsible for crosswalk operations.

Protected routes require a valid JWT
token before accessing crosswalk data.
========================================
*/

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import crosswalkService from "../services/crosswalkService.js";

const router = express.Router();

router.get("/", authMiddleware, crosswalkService.getAllCrosswalks);

export default router;