/* ============================================================
 * SANDBOX - backend route that forwards an image to the AI service.
 * PROVENANCE: structure = YOSSEF's routes (express.Router + service handler).
 *             [CHANGED] auth left PUBLIC for now (his other routes used authMiddleware;
 *             this one is an internal backend<->AI call, so no user JWT).
 *   POST /api/detect  { imagePath }  -> detections
 * ============================================================ */
import express from "express";                              
import detectService from "../services/detectService.js";   

const router = express.Router();                            

// [CHANGED] no authMiddleware here (decision: internal call, public for now).
router.post("/", detectService.detectObjects);             // [YOSSEF] (minus auth)

export default router;                                      
