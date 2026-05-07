import mongoose from "mongoose";

const crosswalkSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Unique identifier for the crosswalk
    location: { type: String, required: true }, // e.g., "HIT Campus - North Gate"
    ledCommandUrl: { type: String }, // URL to trigger the crosswalk signal
    status: { type: String, enum: ["Walk", "Don't Walk"], default: "Don't Walk" },
    lastUpdated: { type: Date, default: Date.now }
}); 

const Crosswalk = mongoose.model("Crosswalk", crosswalkSchema);
export default Crosswalk;   