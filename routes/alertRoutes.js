/*
===============
Routes responsible for alert operations.

Protected routes require a valid JWT
token before accessing alert data.
========================================
*/

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    createAlert,
    getAlerts
} from "../services/alertService.js";

const router = express.Router();

router.post("/", authMiddleware, createAlert);

router.get("/", authMiddleware, getAlerts);

export default router;