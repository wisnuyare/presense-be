import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { AuthRequest } from "../types/express";
import { createEmployee, getEmployeeNameByUserId } from "../models/employeeModel";
import { createUser, getUserByUsername } from "../models/userModel";

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    const user = await getUserByUsername(username.trim());

    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const name = await getEmployeeNameByUserId(user.id);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.json({ message: "Login successful", role: user.role, name });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.json({ message: "Logout successful" });
};

export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password, role, name, birthdate } = req.body;

    if (!username || !password || !role || !name || !birthdate) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (role !== "employee") {
      res.status(400).json({ message: "Only employees can be added" });
      return;
    }

    const existingUser = await getUserByUsername(username.trim());
    if (existingUser) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }

    const userId = await createUser(username.trim(), password, role);

    await createEmployee(name.trim(), birthdate, userId);

    res.status(201).json({ message: "Employee registered successfully" });
  } catch (error) {
    console.error("Error registering employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
