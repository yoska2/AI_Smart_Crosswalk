// PROVENANCE: [RACHE] your service.
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache).
 * ============================================================ */

/**
 * services/ledService.js
 * ----------------------
 * Handles LEDs: create an LED, get all LEDs, and get LEDs for a specific crosswalk.
 */

import LED from '../models/led.js';

// Create and save a new LED document.
export const createLed = async (ledData) => {
    const newLed = new LED(ledData);
    return await newLed.save();
};

// Return every LED in the DB.
export const fetchAllLeds = async () => {
    return await LED.find();
};

// Return only the LEDs that belong to a given crosswalk.
export const fetchLedsByCrosswalk = async (crosswalkId) => {
    return await LED.find({ crosswalkId });
};

// Update an LED by its code (the `id` field, e.g. "led_101") - NOT Mongo's _id.
// Partial update; also refreshes lastUpdated. Returns null if not found.
export const updateLed = async (id, updates) => {
    return await LED.findOneAndUpdate(
        { id },
        { ...updates, lastUpdated: Date.now() },
        { new: true, runValidators: true }
    );
};
