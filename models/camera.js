import mongoose from "mongoose";
import Crosswalk from "./Crosswalk";

const cameraSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Unique identifier for the camera 
    crosswalkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crosswalk', required: true }, // Reference to the associated crosswalk
    status: { type: String, enum: ['Active', 'Inactive'], default: "Inactive" },
    lastUpdated: { type: Date, default: Date.now }
   });     

const Camera = mongoose.model("Camera", cameraSchema);
export default Camera;