// PROVENANCE: [RACHE] your model.
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache).
 * ============================================================ */

/**
 * models/crosswalk.js
 * -------------------
 * Mongoose schema for a crosswalk (a physical pedestrian crossing).
 * The fields mirror the "crosswalks" section of dummy-data.json, so the
 * frontend (which was built against the dummy) works unchanged against the
 * real database. `_id` is the human-readable crosswalk code (e.g. "cw_001").
 */
import mongoose from "mongoose";

const crosswalkSchema = new mongoose.Schema({
    _id: { type: String },                        // crosswalk code, e.g. "cw_001"
    areaId: { type: String },                     // area/zone code, e.g. "area_holon_01"
    areaName: { type: String },                   // area name, e.g. "מרכז העיר"
    location: { type: String, required: true },   // street address, e.g. "הרצל 45, חולון"
    city: { type: String },                       // city name, e.g. "חולון"
    ledCommandUrl: { type: String },              // URL that activates this crosswalk's LEDs
    isActive: { type: Boolean, default: true },   // is the crosswalk currently operational
    cameras: [{ type: String }]                   // camera codes attached to this crosswalk
});

const Crosswalk = mongoose.model("Crosswalk", crosswalkSchema);
export default Crosswalk;
