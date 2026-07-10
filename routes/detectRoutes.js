/*
========================================
Routes responsible for object detection.

Assumes the image has already been saved on the server
and only its file path is passed in the request body.
========================================
*/

import express from "express";
import detectService from "../services/detectService.js";

const router = express.Router();

// POST /detect - runs YOLOv8 detection on an already-saved image.
router.post("/", detectService.detectObjects);

export default router;
