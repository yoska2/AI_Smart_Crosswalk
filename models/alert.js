import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    crosswalkId: { type: String, required: true }, // crosswalk code, e.g. "cw_001"
    cameraId: { type: String, required: true }, // camera code, e.g. "cam_101" - the device that triggered the alert
    location: { type: String }, // e.g., "HIT Campus - North Gate"
    description: { type: String }, // e.g., "Pedestrian inside crosswalk ROI"
    imageUrl: { type: String }, // URL to the image or video evidence
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    isResolved: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Alert', alertSchema);