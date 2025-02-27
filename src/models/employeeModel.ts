import { RowDataPacket } from "mysql2/promise";
import db from "../config/db";

export const createEmployee = async (name: string, birthdate: string, userId: number) => {
  await db.query("INSERT INTO employees (name, birthdate, user_id) VALUES (?, ?, ?)", [
    name,
    birthdate,
    userId,
  ]);
};

export const getAllEmployees = async (search?: string) => {
  let query = "SELECT * FROM employees";
  let params: any[] = [];
  if (search) {
    query += " WHERE name LIKE ?";
    params.push(`%${search}%`);
  }

  const [employees] = await db.execute(query, params);
  return employees;
};

export const getEmployeeIdByUserId = async (user_id: number): Promise<number | null> => {
  let query = `
        SELECT id
        FROM employees 
        WHERE user_id = ?
    `;
  let params: any[] = [user_id];

  const [rows] = await db.execute<RowDataPacket[]>(query, params);

  if (rows.length > 0) {
    return rows[0].id;
  } else {
    return null;
  }
};

export const getEmployeeNameByUserId = async (user_id: number): Promise<number | null> => {
  let query = `
        SELECT name
        FROM employees 
        WHERE user_id = ?
    `;
  let params: any[] = [user_id];

  const [rows] = await db.execute<RowDataPacket[]>(query, params);

  if (rows.length > 0) {
    return rows[0].name;
  } else {
    return null;
  }
};

export const updateEmployee = async (name: string, birthdate: string, userId: number) => {
  await db.query("UPDATE employees SET name = ?, birthdate = ? WHERE user_id = ?", [
    name,
    birthdate,
    userId,
  ]);
};
