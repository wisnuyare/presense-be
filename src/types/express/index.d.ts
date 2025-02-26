import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    password: string;
    role: "employee" | "hr";
  };
}
