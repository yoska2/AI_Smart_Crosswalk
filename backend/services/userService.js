// PROVENANCE: [YOSSEF] his auth service.
/* ============================================================
 * SANDBOX FILE - SETTLED. Yossef's auth code (already integrated into your repo).
 * ============================================================ */

/*
========================================
services/userService.js
Service responsible for user-related operations:
registration, authentication, password hashing,
JWT generation, and database access.
========================================
*/
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Register a new user (hashes the password before saving).
const register = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        // Reject if the email is already taken.
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password (never store it in plain text).
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            id: crypto.randomUUID(),
            username: username,
            email: email,
            passwordHash: passwordHash,
        });
        await user.save();

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Log a user in: verify the password and return a signed JWT.
const login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Suspended accounts cannot log in.
        if (user.status === "suspended") {
            return res.status(403).json({ message: "Account is suspended" });
        }

        // Sign a token valid for 24h (uses JWT_SECRET from .env).
        // role is embedded so protected routes can do role checks (req.user.role).
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Return role (+ username) so the frontend can route to the right dashboard.
        return res.status(200).json({ token, role: user.role, username: user.username });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- Admin user management (CRUD) ---
// All three are Admin-only; wrap the routes with authMiddleware, and each
// method also checks req.user.role === 'Admin' as a second guard.

// GET /api/users - list all users (never returns passwordHash).
const getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Admin only" });
        }
        const users = await User.find().select("-passwordHash");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/:id - update a user's role/status/username/email.
// Password changes are intentionally NOT handled here.
const updateUser = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Admin only" });
        }
        // Only allow safe fields to be updated (never passwordHash directly).
        const { role, status, username, email } = req.body;
        const updates = {};
        if (role !== undefined) updates.role = role;
        if (status !== undefined) updates.status = status;
        if (username !== undefined) updates.username = username;
        if (email !== undefined) updates.email = email;

        const updated = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,            // return the document after the update
            runValidators: true,  // enforce the schema enums (role/status)
        }).select("-passwordHash");

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// DELETE /api/users/:id - remove a user.
const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Admin only" });
        }
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default {
    register: register,
    login: login,
    getAllUsers: getAllUsers,
    updateUser: updateUser,
    deleteUser: deleteUser,
};
