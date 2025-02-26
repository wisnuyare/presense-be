import db from "../config/db";

export const logAttendance = async (employee_id: number, photo: string) => {
  const query = "INSERT INTO attendance (employee_id, photo) VALUES (?, ?)";
  await db.execute(query, [employee_id, photo]);
};

export const getAllAttendance = async (search?: string) => {
  let query = `
        SELECT a.id, e.name, a.timestamp, a.photo
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
    `;
  let params: any[] = [];

  if (search) {
    query += " WHERE e.name LIKE ?";
    params.push(`%${search}%`);
  }

  const [attendance] = await db.execute(query, params);
  return attendance;
};
