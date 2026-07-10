/*
========================================
Routes responsible for user operations.

This file handles:
- User registration
- User login

========================================
*/

import express from "express";
import userService from "../services/userService.js";

const router = express.Router();

// User registration
router.post("/register", userService.register);

// User login
router.post("/login", userService.login);

export default router;