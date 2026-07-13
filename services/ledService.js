import LED from '../models/led.js';

export const createLed = async (ledData) => {
    const newLed = new LED(ledData);
    return await newLed.save();
};

export const fetchAllLeds = async () => {
    return await LED.find();
};

export const fetchLedsByCrosswalk = async (crosswalkId) => {
    return await LED.find({ crosswalkId });
};
