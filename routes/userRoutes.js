/*
========================================
routes/userRoutes.js
HTTP endpoints for user auth (mounted at /api/users):
  POST /register -> create an account
  POST /login    -> log in and receive a JWT
(Brought in from Yossef's branch yosi-B1.)
========================================
*/
import express from "express";
import userService from "../services/userService.js";

const router = express.Router();

router.post("/register", userService.register);
router.post("/login", userService.login);

export default router;
