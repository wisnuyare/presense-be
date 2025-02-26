import db from "../config/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2/promise";

interface User extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: string;
}

export const createUser = async (username: string, password: string, role: string) => {
  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into DB
  const [result]: any = await db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role]
  );

  return result.insertId; // Return user ID
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const [users] = await db.query<User[]>("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length === 0) {
      return null;
    }

    return users[0]; // Return the first user
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
