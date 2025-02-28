import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerUser, loginUser } from "../../controllers/authController";
import { createUser, getUserByUsername } from "../../models/userModel";
import { createEmployee } from "../../models/employeeModel";

jest.mock("../../models/userModel");
jest.mock("../../models/employeeModel");

describe("Auth Controller", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "testsecret"; // Set the JWT secret for testing
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    test("should return 400 if required fields are missing", async () => {
      const req = {
        body: {},
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
    });

    test("should return 201 when user registers successfully", async () => {
      (createUser as jest.Mock).mockResolvedValue(1);
      (createEmployee as jest.Mock).mockResolvedValue(1);

      const token = jwt.sign({ id: 1, username: "admin", role: "hr" }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      const req = {
        body: {
          username: "testuser120",
          password: "password123",
          role: "employee",
          name: "John Doe",
          birthdate: "1990-01-01",
        },
        cookies: {
          token,
        },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee registered successfully" });
    });
  });

  describe("loginUser", () => {
    test("should return 400 if username is missing", async () => {
      const req = {
        body: { password: "password123" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Username and password are required" });
    });

    test("should return 400 if password is missing", async () => {
      const req = {
        body: { username: "testuser" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Username and password are required" });
    });

    test("should return 401 if user is not found", async () => {
      (getUserByUsername as jest.Mock).mockResolvedValue(null);

      const req = {
        body: { username: "testuser", password: "password123" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
    });

    test("should return 401 if password is incorrect", async () => {
      const hashedPassword = await bcrypt.hash("wrongpassword", 10);
      (getUserByUsername as jest.Mock).mockResolvedValue({ id: 1, username: "testuser", password: hashedPassword });

      const req = {
        body: { username: "testuser", password: "password123" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
    });

    test("should login a user", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      (getUserByUsername as jest.Mock).mockResolvedValue({ id: 1, username: "testuser", password: hashedPassword });

      const req = {
        body: { username: "testuser120", password: "password123" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Login successful", token: expect.any(String) });
    });

    test("should handle errors", async () => {
      const req = {
        body: { username: "testuser", password: "password123" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;

      (getUserByUsername as jest.Mock).mockRejectedValue(new Error("Database error"));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error", error: expect.any(Error) });
    });
  });
});
