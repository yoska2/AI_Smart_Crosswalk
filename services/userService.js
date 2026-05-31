/*
========================================
Service responsible for user-related
operations.

Responsibilities:
- User registration
- User authentication
- Password validation
- JWT generation
- Database communication
========================================
*/

import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";



/*
========================================
User Registration
========================================
*/
export const register = async (req, res) => {

    try {

        // Extract user information
        const {
            username,
            email,
            password
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {

            return res.status(400).json({
                message: "Email already exists"
            });

        }

        // Generate password hash
        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        // Create new user
        const user = new User({
            id: crypto.randomUUID(),
            username,
            email,
            passwordHash
        });

        // Save user
        await user.save();

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};



/*
========================================
User Login
========================================
*/
export const login = async (req, res) => {

    try {

        // Extract credentials
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({
            email
        });

        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isMatch) {

            return res.status(401).json({
                message: "Invalid email or password"
            });

        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return res.status(200).json({
            token
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};