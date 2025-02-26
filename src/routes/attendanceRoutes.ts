import express from "express";
import { recordAttendance, fetchAttendance } from "../controllers/attendanceController";
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware";
import { UserRole } from "../types/userRole";

const router = express.Router();

router.post("/attendance", authenticateUser, authorizeRole(UserRole.EMPLOYEE), recordAttendance);

router.get("/attendance", authenticateUser, authorizeRole(UserRole.HR), fetchAttendance);

export default router;
