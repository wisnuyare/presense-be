import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import { UserRole } from "../types/userRole";

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (typeof decoded === "string") {
      res.status(400).json({ message: "Invalid token format." });
      return;
    }

    req.user = decoded as {
      id: number;
      username: string;
      password: string;
      role: "employee" | "hr";
    }; // Ensure it matches your defined type
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export const authorizeRole = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
    } else {
      next();
    }
  };
};
