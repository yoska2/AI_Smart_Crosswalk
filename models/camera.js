/**
 * models/camera.js
 * ----------------
 * Mongoose schema for a camera mounted at a crosswalk.
 * Matches the "cameras" section of dummy-data.json.
 */
import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema({
    id: { type: String, required: true },          // camera code, e.g. "cam_101"
    crosswalkId: { type: String, required: true }, // the crosswalk it belongs to, e.g. "cw_001"
    status: { type: String, enum: ['Active', 'Inactive'], default: "Inactive" }, // camera health
    lastUpdated: { type: Date, default: Date.now } // last time the status changed
});

const Camera = mongoose.model("Camera", cameraSchema);
export default Camera;
