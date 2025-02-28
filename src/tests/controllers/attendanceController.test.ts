import { recordAttendance, fetchAttendance } from "../../controllers/attendanceController";
import { logAttendance, getAllAttendance } from "../../models/attendanceModel";
import { AuthRequest } from "../../types/express";
import { Request, Response } from "express";

jest.mock("../../models/attendanceModel");

describe("Attendance Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("recordAttendance", () => {
    test("should return 400 if photo is missing", async () => {
      const req = { body: {}, user: { id: 1 } } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await recordAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Photo is required and user must be authenticated",
      });
    });

    test("should log attendance", async () => {
      const req = { body: { photo: "photo.jpg" }, user: { id: 1 } } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      (logAttendance as jest.Mock).mockResolvedValue({ insertId: 1 });

      await recordAttendance(req, res);

      expect(logAttendance).toHaveBeenCalledWith(1, "photo.jpg");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Attendance logged successfully" });
    });

    test("should return 400 if user is not authenticated", async () => {
      const req = { body: { photo: "photo.jpg" } } as AuthRequest;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      await recordAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Photo is required and user must be authenticated",
      });
    });
  });

  describe("fetchAttendance", () => {
    test("should return attendance records", async () => {
      const req = { query: {} } as Request;
      const res = { json: jest.fn() } as unknown as Response;
      const attendanceData = [
        { id: 1, name: "John Doe", timestamp: "2023-10-01", photo: "photo.jpg" },
      ];

      (getAllAttendance as jest.Mock).mockResolvedValue(attendanceData);

      await fetchAttendance(req, res);

      expect(res.json).toHaveBeenCalledWith(attendanceData);
    });

    test("should handle errors", async () => {
      const req = { query: {} } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      (getAllAttendance as jest.Mock).mockRejectedValue(new Error("Database error"));

      await fetchAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });
});
