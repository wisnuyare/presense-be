import express from "express";
import { check } from "express-validator";
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware";
import { loginUser, logoutUser, registerUser } from "../controllers/authController";
import { UserRole } from "../types/userRole";
import { validateInput } from "../middleware/validateInput";

const registerValidationRules = [
  check("name").trim().escape().isLength({ min: 1 }).withMessage("Name is required"),
  check("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  check("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Username must be at least 1 characters long"),
];

const loginValidationRules = [
    check("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Username must be at least 1 characters long"),
]

const router = express.Router();

router.post("/login", validateInput(loginValidationRules), loginUser);

router.post("/logout", logoutUser);

router.post(
  "/register",
  validateInput(registerValidationRules),
  authenticateUser,
  authorizeRole(UserRole.HR),
  registerUser
);

export default router;
