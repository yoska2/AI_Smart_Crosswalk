/* ============================================================
 * SANDBOX - backend route that forwards an image to the AI service.
 * PROVENANCE: structure = YOSSEF's routes (express.Router + service handler).
 *             [CHANGED] auth left PUBLIC for now (his other routes used authMiddleware;
 *             this one is an internal backend<->AI call, so no user JWT).
 * Legend:  [YOSSEF]=his code   [RACHE]=your code   [MERGE]=changed for the merge
 *   POST /api/detect  { imagePath }  -> detections
 * ============================================================ */
import express from "express";                              // [YOSSEF]
import detectService from "../services/detectService.js";   // [YOSSEF]

const router = express.Router();                            // [YOSSEF]

// [CHANGED] no authMiddleware here (decision: internal call, public for now).
router.post("/", detectService.detectObjects);             // [YOSSEF] (minus auth)

export default router;                                      // [YOSSEF]
