/*
========================================
services/userService.js
Service responsible for user-related operations:
registration, authentication, password hashing,
JWT generation, and database access.
(Brought in from Yossef's branch yosi-B1.)
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

        // Sign a token valid for 24h (uses JWT_SECRET from .env).
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default { register: register, login: login };
