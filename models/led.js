import mongoose from "mongoose";    

const ledSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Unique identifier for the LED
    crosswalkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crosswalk', required: true }, // Reference to the associated crosswalk
    status: { type: String, enum: ['On', 'Off'], default: 'Off' },
    lastUpdated: { type: Date, default: Date.now }
}); 

const LED = mongoose.model("LED", ledSchema);
export default LED;