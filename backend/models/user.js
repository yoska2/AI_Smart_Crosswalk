// PROVENANCE: [RACHE] your model (fields must match Yossef's auth).
/* ============================================================
 * SANDBOX FILE - SETTLED. Copied UNCHANGED from your real repo (branch sprint4-rache). (user.js must keep username/email/passwordHash/role for Yossef's auth.)
 * ============================================================ */

/**
 * models/user.js
 * --------------
 * Mongoose schema for a system user (operator / admin) who logs into the
 * dashboard. Passwords are stored hashed, never in plain text.
 */
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },                       // user code
    username: { type: String, required: true, unique: true },   // login name
    email: { type: String, required: true, unique: true },      // contact email
    passwordHash: { type: String, required: true },             // hashed password (never plain)
    // permission level - frontend routes to a dashboard based on this
    role: { type: String, enum: ['Admin', 'Manager', 'Dispatcher', 'Technician'], default: 'Technician' },
    // account state - lets an Admin suspend a user without deleting them
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    createdAt: { type: Date, default: Date.now }                // account creation time
});

const User = mongoose.model("User", userSchema);
export default User;
