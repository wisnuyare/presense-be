import { logAttendance, getAllAttendance } from "../../models/attendanceModel";
import db from "../../config/db";
import { OkPacket, RowDataPacket } from "mysql2";

jest.mock("../../config/db");

describe("Attendance Model", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("logAttendance should insert a new attendance record", async () => {
    const mockExecute = jest.spyOn(db, "execute").mockResolvedValue([{} as OkPacket, []]);

    await logAttendance(1, "photo.jpg");

    expect(mockExecute).toHaveBeenCalledWith(
      "INSERT INTO attendance (employee_id, photo) VALUES (?, ?)",
      [1, "photo.jpg"]
    );
  });

  test("getAllAttendance should return all attendance records", async () => {
    const mockExecute = jest.spyOn(db, "execute").mockResolvedValue([[{ id: 1, name: "John Doe", timestamp: "2023-01-01", photo: "photo.jpg" }] as RowDataPacket[], []]);

    const attendance = await getAllAttendance();

    expect(mockExecute).toHaveBeenCalledWith(
      `
        SELECT a.id, e.name, a.timestamp, a.photo
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
    `.trim(),
      []
    );
    expect(attendance).toEqual([{ id: 1, name: "John Doe", timestamp: "2023-01-01", photo: "photo.jpg" }]);
  });
});
