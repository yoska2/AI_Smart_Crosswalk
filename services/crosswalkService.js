import Crosswalk from '../models/Crosswalk.js';

// Logic to fetch all crosswalks
export const fetchAllCrosswalks = async () => {
    return await Crosswalk.find();
};