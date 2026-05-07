import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    id: { type: String, required: true }, // ID of the camera/sensor
    crosswalkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crosswalk', required: true }, // Reference to the associated crosswalk
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera', required: true }, // ID of the device that triggered the alert
    location: { type: String, required: true }, // e.g., "HIT Campus - North Gate"
    imageUrl: { type: String }, // URL to the image or video evidence
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    isResolved: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Alert', alertSchema);