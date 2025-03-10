import { Request, Response } from "express";
import {
  getAllEmployees,
  getEmployeeIdByUserId,
  updateEmployee,
  deleteEmployee,
} from "../models/employeeModel";

export const fetchEmployees = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;

    const employees = await getAllEmployees(search);
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, name, birthdate } = req.body;

    if (!user_id || !name || !birthdate) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if user already exists
    const isExist = await getEmployeeIdByUserId(user_id);
    if (!isExist) {
      res.status(400).json({ message: "Employee doesn't exist" });
      return;
    }

    await updateEmployee(name.trim(), birthdate, user_id);

    res.status(201).json({ message: "Employee edited successfully" });
  } catch (error) {
    console.error("Error registering employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.body;

    const employeeId = await getEmployeeIdByUserId(user_id);

    if (!employeeId) {
      res.status(400).json({ message: "Employee doesn't exist" });
      return;
    }

    if (!user_id) {
      res.status(400).json({ message: "Employee ID is required" });
      return;
    }

    const result = await deleteEmployee(employeeId, user_id);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
