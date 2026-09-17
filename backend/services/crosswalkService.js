// PROVENANCE: [RACHE] your service.
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache).
 * ============================================================ */

/**
 * services/crosswalkService.js
 * ----------------------------
 * Handles crosswalks: create a crosswalk and get all crosswalks.
 */

import Crosswalk from '../models/crosswalk.js';

// Create and save a new crosswalk document.
export const createCrosswalk = async (crosswalkData) => {
    const newCrosswalk = new Crosswalk(crosswalkData);
    return await newCrosswalk.save();
};

// Return every crosswalk with its cameras and LEDs embedded (statuses included).
// One aggregation instead of 3 calls: $lookup joins on the crosswalk code
// (_id "cw_001") against each device's crosswalkId. The frontend gets a single
// unified object per crosswalk. NOTE: the `cameras` string array is replaced by
// the full camera documents.
export const fetchAllCrosswalks = async () => {
    return await Crosswalk.aggregate([
        { $lookup: { from: 'cameras', localField: '_id', foreignField: 'crosswalkId', as: 'cameras' } },
        { $lookup: { from: 'leds', localField: '_id', foreignField: 'crosswalkId', as: 'leds' } },
    ]);
};

// Update a crosswalk by id (e.g. a technician toggles isActive / equipment).
// Partial update: only the fields sent in the body are changed.
// Returns the updated document, or null if the id was not found.
export const updateCrosswalk = async (id, updates) => {
    return await Crosswalk.findByIdAndUpdate(id, updates, {
        returnDocument: 'after', // return the document after the update
        runValidators: true,
    });
};
