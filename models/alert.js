import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    // --- Identity / source ---
    eventId: { type: String, index: true }, // UUID from the AI node, for idempotency / de-duplication
    crosswalkId: { type: String, required: true }, // crosswalk code, e.g. "cw_001"
    cameraId: { type: String, required: true }, // camera code, e.g. "cam_101" - the device that triggered the alert
    location: { type: String }, // e.g., "HIT Campus - North Gate"

    // --- Danger data (from the AI "brain") ---
    description: { type: String }, // e.g., "Pedestrian approaching crosswalk"
    distanceFromCrosswalk: { type: Number }, // meters from the crossing (approach distance)
    approachSpeed: { type: Number }, // m/s toward the crossing (optional)
    confidence: { type: Number }, // 0-100, how confident the case is dangerous
    personType: { type: String, enum: ['child', 'adult', 'unknown'], default: 'unknown' },
    distracted: { type: Boolean, default: false }, // e.g. looking at phone
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },

    // --- Two-threshold model ---
    // ledTriggered = true only for emergencies that actually lit the road LEDs.
    // Non-emergency approaches are still logged (for analytics) with ledTriggered = false.
    ledTriggered: { type: Boolean, default: false },

    // --- Evidence / lifecycle ---
    imageUrl: { type: String }, // Cloudinary URL of the snapshot
    isResolved: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Alert', alertSchema);
