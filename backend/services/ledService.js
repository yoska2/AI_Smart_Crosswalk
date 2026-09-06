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
