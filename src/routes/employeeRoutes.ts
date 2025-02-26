import express from "express";
import { editEmployee, fetchEmployees } from "../controllers/employeeController";
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware";
import { UserRole } from "../types/userRole";

const router = express.Router();

router.get("/employees", authenticateUser, authorizeRole(UserRole.HR), fetchEmployees);

router.put("/employees", authenticateUser, authorizeRole(UserRole.HR), editEmployee);

export default router;
