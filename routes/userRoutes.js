/*
========================================
Routes responsible for user operations.

This file handles:
- User registration
- User login

========================================
*/

import express from "express";
import {
    login,
    register
} from "../services/userService.js";

const router = express.Router();

// User registration
router.post("/register", register);

// User login
router.post("/login", login);

export default router;