import { createEmployee, getAllEmployees, getEmployeeIdByUserId, getEmployeeNameByUserId, updateEmployee } from "../../models/employeeModel";
import db from "../../config/db";
import { OkPacket, RowDataPacket } from "mysql2";

jest.mock("../../config/db");

describe("Employee Model", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createEmployee should insert a new employee", async () => {
    const mockQuery = jest.spyOn(db, "query").mockResolvedValue([{} as OkPacket, []]);

    await createEmployee("John Doe", "1990-01-01", 1);

    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO employees (name, birthdate, user_id) VALUES (?, ?, ?)",
      ["John Doe", "1990-01-01", 1]
    );
  });

  test("getAllEmployees should return all employees", async () => {
    const mockExecute = jest.spyOn(db, "execute").mockResolvedValue([[{ id: 1, name: "John Doe" }] as RowDataPacket[], []]);

    const employees = await getAllEmployees();

    expect(mockExecute).toHaveBeenCalledWith("SELECT * FROM employees", []);
    expect(employees).toEqual([{ id: 1, name: "John Doe" }]);
  });

  test("getEmployeeIdByUserId should return employee id", async () => {
    const mockExecute = jest.spyOn(db, "execute").mockResolvedValue([[{ id: 1 }] as RowDataPacket[], []]);

    const employeeId = await getEmployeeIdByUserId(1);

    expect(mockExecute).toHaveBeenCalledWith(
      `
        
        SELECT id
        FROM employees 
        WHERE user_id = ?
      `.trim(),
      [1]
    );
    expect(employeeId).toBe(1);
  });

  test("getEmployeeNameByUserId should return employee name", async () => {
    const mockExecute = jest.spyOn(db, "execute").mockResolvedValue([[{ name: "John Doe" }] as RowDataPacket[], []]);

    const employeeName = await getEmployeeNameByUserId(1);

    expect(mockExecute).toHaveBeenCalledWith(
      `
        
        SELECT name
        FROM employees 
        WHERE user_id = ?
      `.trim(),
      [1]
    );
    expect(employeeName).toBe("John Doe");
  });

  test("updateEmployee should update employee details", async () => {
    const mockQuery = jest.spyOn(db, "query").mockResolvedValue([{} as OkPacket, []]);

    await updateEmployee("John Doe", "1990-01-01", 1);

    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE employees SET name = ?, birthdate = ? WHERE user_id = ?",
      ["John Doe", "1990-01-01", 1]
    );
  });
});
