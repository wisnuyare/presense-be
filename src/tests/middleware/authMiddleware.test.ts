import { Request, Response, NextFunction } from "express";
import { authenticateUser, authorizeRole } from "../../middleware/authMiddleware";
import { UserRole } from "../../types/userRole";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  describe("authenticateUser", () => {
    it("should return 401 if no token is provided", () => {
      const req = {
        cookies: {},
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;
      const next = jest.fn() as NextFunction;

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied. No token provided." });
    });

    it("should return 400 if token is invalid", () => {
      const req = {
        cookies: { token: "invalidtoken" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;
      const next = jest.fn() as NextFunction;

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token." });
    });

    it("should call next if token is valid", () => {
      const req = {
        cookies: { token: "validtoken" },
      } as Partial<Request> as Request;
      const res = {} as Partial<Response> as Response;
      const next = jest.fn() as NextFunction;

      (jwt.verify as jest.Mock).mockReturnValue({ id: 1, role: "employee" });

      authenticateUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("authorizeRole", () => {
    it("should return 403 if user role is insufficient", () => {
      const req = {
        user: { role: "employee" },
      } as Partial<Request> as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response> as Response;
      const next = jest.fn() as NextFunction;

      const middleware = authorizeRole(UserRole.HR);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied. Insufficient permissions." });
    });

    it("should call next if user role is sufficient", () => {
      const req = {
        user: { role: "hr" },
      } as Partial<Request> as Request;
      const res = {} as Partial<Response> as Response;
      const next = jest.fn() as NextFunction;

      const middleware = authorizeRole(UserRole.HR);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
