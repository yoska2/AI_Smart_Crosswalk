/*
===============
Routes responsible for alert operations.

Protected routes require a valid JWT
token before accessing alert data.
========================================
*/

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import alertService from "../services/alertService.js";

const router = express.Router();

router.post("/", authMiddleware, alertService.createAlert);

router.get("/", authMiddleware, alertService.getAlerts);

export default router;