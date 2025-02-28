import { createUser, getUserByUsername } from "../../models/userModel";
import db from "../../config/db";
import bcrypt from "bcrypt";

jest.mock("../../config/db");
jest.mock("bcrypt");

describe("createUser", () => {
  it("should create a new user and return the user ID", async () => {
    const username = "testuser";
    const password = "password";
    const role = "employee";
    const hashedPassword = "hashedpassword";

    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    (db.query as jest.Mock).mockResolvedValue([{ insertId: 1 }]);

    const userId = await createUser(username, password, role);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );
    expect(userId).toBe(1);
  });

  // ...additional tests for error handling...
});

describe("getUserByUsername", () => {
  it("should return a user if found", async () => {
    const username = "testuser";
    const user = { id: 1, username, password: "hashedpassword", role: "employee" };

    (db.query as jest.Mock).mockResolvedValue([[user]]);

    const result = await getUserByUsername(username);

    expect(db.query).toHaveBeenCalledWith("SELECT * FROM users WHERE username = ?", [username]);
    expect(result).toEqual(user);
  });

  // ...additional tests for user not found, error handling...
});
