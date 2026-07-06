import Crosswalk from '../models/Crosswalk.js';

// Logic to create a new crosswalk
export const createCrosswalk = async (crosswalkData) => {
    const newCrosswalk = new Crosswalk(crosswalkData);
    return await newCrosswalk.save();
};

// Logic to fetch all crosswalks
export const fetchAllCrosswalks = async () => {
    return await Crosswalk.find();
};