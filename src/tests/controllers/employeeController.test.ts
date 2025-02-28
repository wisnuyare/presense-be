import { Request, Response } from "express";
import { fetchEmployees, editEmployee } from "../../controllers/employeeController";
import { getAllEmployees, getEmployeeIdByUserId, updateEmployee } from "../../models/employeeModel";

jest.mock("../../models/employeeModel");

describe("Employee Controller", () => {
  describe("fetchEmployees", () => {
    it("should return a list of employees", async () => {
      const req = {
        query: {
          search: "",
        },
      } as Partial<Request> as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as Partial<Response> as Response;

      (getAllEmployees as jest.Mock).mockResolvedValue([{ id: 1, name: "John Doe" }]);

      await fetchEmployees(req, res);

      expect(getAllEmployees).toHaveBeenCalledWith("");
      expect(res.json).toHaveBeenCalledWith([{ id: 1, name: "John Doe" }]);
    });

    it("should handle errors", async () => {
      const req = {
        query: {
          search: "",
        },
      } as Partial<Request> as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as Partial<Response> as Response;

      (getAllEmployees as jest.Mock).mockRejectedValue(new Error("Database error"));

      await fetchEmployees(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("editEmployee", () => {
    it("should edit an existing employee", async () => {
      const req = {
        body: {
          user_id: 1,
          name: "Jane Doe",
          birthdate: "1990-01-01",
        },
      } as Partial<Request> as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as Partial<Response> as Response;

      (getEmployeeIdByUserId as jest.Mock).mockResolvedValue(1);
      (updateEmployee as jest.Mock).mockResolvedValue(undefined);

      await editEmployee(req, res);

      expect(getEmployeeIdByUserId).toHaveBeenCalledWith(1);
      expect(updateEmployee).toHaveBeenCalledWith("Jane Doe", "1990-01-01", 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee edited successfully" });
    });

    it("should return 400 if employee does not exist", async () => {
      const req = {
        body: {
          user_id: 1,
          name: "Jane Doe",
          birthdate: "1990-01-01",
        },
      } as Partial<Request> as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as Partial<Response> as Response;

      (getEmployeeIdByUserId as jest.Mock).mockResolvedValue(null);

      await editEmployee(req, res);

      expect(getEmployeeIdByUserId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee doesn't exist" });
    });

    it("should handle errors", async () => {
      const req = {
        body: {
          user_id: 1,
          name: "Jane Doe",
          birthdate: "1990-01-01",
        },
      } as Partial<Request> as Request;
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as Partial<Response> as Response;

      (getEmployeeIdByUserId as jest.Mock).mockRejectedValue(new Error("Database error"));

      await editEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });
});
