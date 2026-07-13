import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Unique identifier for the camera
    crosswalkId: { type: String, required: true }, // crosswalk code, e.g. "cw_001"
    status: { type: String, enum: ['Active', 'Inactive'], default: "Inactive" },
    lastUpdated: { type: Date, default: Date.now }
   });     

const Camera = mongoose.model("Camera", cameraSchema);
export default Camera;