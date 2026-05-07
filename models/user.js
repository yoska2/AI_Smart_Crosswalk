import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // Store hashed passwords
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    createdAt: { type: Date, default: Date.now }
});     

const User = mongoose.model("User", userSchema);
export default User;