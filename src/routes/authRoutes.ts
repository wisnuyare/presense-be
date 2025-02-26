import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/authController";
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware";
import { UserRole } from "../types/userRole";

const router = express.Router();

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/register", authenticateUser, authorizeRole(UserRole.HR), registerUser);

export default router;
