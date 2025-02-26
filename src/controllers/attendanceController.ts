import { Request, Response } from "express";
import { logAttendance, getAllAttendance } from "../models/attendanceModel";
import { AuthRequest } from "../types/express";
import { getEmployeeIdByUserId } from '../models/employeeModel';

export const recordAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { photo } = req.body;
        if (!req.user || !photo) {
            res.status(400).json({ message: "Photo is required and user must be authenticated" });
            return;
        }

        const userId = req.user.id;

        // Fetch the corresponding employee_id using the separate service function
        const employee_id = await getEmployeeIdByUserId(userId);

        if (!employee_id) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }

        await logAttendance(employee_id, photo);
        res.json({ message: "Attendance recorded successfully" });
    } catch (error) {
        console.error("Error logging attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const fetchAttendance = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string;
        const attendance = await getAllAttendance(search);
        res.json(attendance);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
