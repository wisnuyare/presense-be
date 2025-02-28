import { Request, Response } from "express";
import { AuthRequest } from "../types/express";
import { getEmployeeIdByUserId } from "../models/employeeModel";
import { logAttendance, getAllAttendance } from "../models/attendanceModel";

export const recordAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { photo } = req.body;
  const userId = req.user?.id;

  if (!photo || !userId) {
    res.status(400).json({ message: "Photo is required and user must be authenticated" });
    return;
  }

  try {
    await logAttendance(userId, photo);
    res.status(201).json({ message: "Attendance logged successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const fetchAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const attendance = await getAllAttendance();
    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
