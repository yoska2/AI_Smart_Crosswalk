// PROVENANCE: [YOSSEF] his auth service.
/* ============================================================
 * SANDBOX FILE - SETTLED. Yossef's auth code (already integrated into your repo).
 * ============================================================ */

/*
========================================
services/userService.js
Service responsible for user-related operations:
Admin-only user creation, authentication (by username), password hashing,
JWT generation, and database access.
========================================
*/
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.js";

// The frontend may send either Mongo's _id or our own `id` code.
const userFilter = (idParam) => (mongoose.isValidObjectId(idParam) ? { _id: idParam } : { id: idParam });

const MIN_PASSWORD_LENGTH = 6;
const ROLES = User.schema.path("role").enumValues;

// POST /api/users/register - an Admin creates a user (needs a token; there is no public registration).
// The Admin sets the full name, username, temporary password and role.
const createUser = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Admin only" });
        }

        const { username, name, role, password } = req.body;

        if (!username || !name || !password || !role) {
            return res.status(400).json({ message: "name, username, password and role are required" });
        }
        if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }
        if (!ROLES.includes(role)) {
            return res.status(400).json({ message: `Role must be one of: ${ROLES.join(", ")}` });
        }

        // Reject if the username is already taken.
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password (never store it in plain text).
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            id: crypto.randomUUID(),
            name: name,
            username: username,
            passwordHash: passwordHash,
            role: role,
        });
        await user.save();

        return res.status(201).json({
            message: "User created successfully",
            user: { _id: user._id, id: user.id, name: user.name, username: user.username, role: user.role, status: user.status },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Log a user in: verify the password and return a signed JWT.
const login = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if (typeof username !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "username and password are required" });
        }

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Suspended accounts cannot log in.
        if (user.status === "suspended") {
            return res.status(403).json({ message: "Account is suspended" });
        }

        await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

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

// PUT /api/users/:id - update a user's role/status/username/name.
// Password changes are intentionally NOT handled here.
const updateUser = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Admin only" });
        }
        // Only allow safe fields to be updated (never passwordHash directly).
        const { role, status, username, name } = req.body;
        const updates = {};
        if (role !== undefined) updates.role = role;
        if (status !== undefined) updates.status = status;
        if (username !== undefined) updates.username = username;
        if (name !== undefined) updates.name = name;

        const updated = await User.findOneAndUpdate(userFilter(req.params.id), updates, {
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

// PATCH /api/users/:id/status - suspend or re-activate a user. Body: { "status": "suspended" | "active" }.
const setUserStatus = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Admin only" });
        }
        const status = req.body.status;
        if (!User.schema.path("status").enumValues.includes(status)) {
            return res.status(400).json({ message: 'status must be "active" or "suspended"' });
        }
        const updated = await User.findOneAndUpdate(userFilter(req.params.id), { status }, { new: true })
            .select("-passwordHash");
        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/:id - remove a user.
const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Admin only" });
        }
        const deleted = await User.findOneAndDelete(userFilter(req.params.id));
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default {
    createUser: createUser,
    login: login,
    getAllUsers: getAllUsers,
    updateUser: updateUser,
    setUserStatus: setUserStatus,
    deleteUser: deleteUser,
};
