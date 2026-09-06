// PROVENANCE: [RACHE] your model.
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache).
 * ============================================================ */

/**
 * models/led.js
 * -------------
 * Mongoose schema for the LED strip embedded in the road at a crosswalk.
 * Matches the "leds" section of dummy-data.json. `status` is what turns the
 * physical warning lights On/Off.
 */
import mongoose from "mongoose";

const ledSchema = new mongoose.Schema({
    id: { type: String, required: true },          // LED code, e.g. "led_101"
    crosswalkId: { type: String, required: true }, // the crosswalk it belongs to, e.g. "cw_001"
    status: { type: String, enum: ['On', 'Off'], default: 'Off' }, // are the road lights lit
    lastUpdated: { type: Date, default: Date.now } // last time the status changed
});

const LED = mongoose.model("LED", ledSchema);
export default LED;
