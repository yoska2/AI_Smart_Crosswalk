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

// Return every crosswalk in the DB.
export const fetchAllCrosswalks = async () => {
    return await Crosswalk.find();
};
