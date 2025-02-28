import express from "express";
import { check } from "express-validator";
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware";
import { editEmployee, fetchEmployees, removeEmployee } from "../controllers/employeeController";
import { UserRole } from "../types/userRole";
import { validateInput } from "../middleware/validateInput";

const registerValidationRules = [
  check("name").trim().escape().isLength({ min: 1 }).withMessage("Name is required"),
];

const router = express.Router();

router.get("/employees", authenticateUser, authorizeRole(UserRole.HR), fetchEmployees);

router.put(
  "/employees",
  validateInput(registerValidationRules),
  authenticateUser,
  authorizeRole(UserRole.HR),
  editEmployee
);

router.delete("/employees", authenticateUser, authorizeRole(UserRole.HR), removeEmployee);
export default router;
