// PROVENANCE: [YOSSEF] his auth route.
/* ============================================================
 * SANDBOX FILE - SETTLED. Yossef's auth code (already integrated into your repo).
 * ============================================================ */

/*
========================================
routes/userRoutes.js
HTTP endpoints for users (mounted at /api/users):
  POST   /register -> create an account
  POST   /login    -> log in and receive a JWT (+ role)
  GET    /         -> list all users            (Admin only)
  PUT    /:id      -> update a user role/status  (Admin only)
  DELETE /:id      -> delete a user              (Admin only)
(Auth from Yossef's branch yosi-B1; CRUD added in Sprint 4 for the Admin dashboard.)
========================================
*/
import express from "express";
import userService from "../services/userService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public auth endpoints.
router.post("/register", userService.register);
router.post("/login", userService.login);

// Admin-only user management. authMiddleware verifies the JWT and attaches
// req.user; the service methods then check req.user.role === 'Admin'.
router.get("/", authMiddleware, userService.getAllUsers);
router.put("/:id", authMiddleware, userService.updateUser);
router.delete("/:id", authMiddleware, userService.deleteUser);

export default router;
