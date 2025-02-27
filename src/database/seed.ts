import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const seedDatabase = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await db.execute("DELETE FROM attendance");
    await db.execute("DELETE FROM employees");
    await db.execute("DELETE FROM users");

    // Create HR user
    const hrPassword = await hashPassword("hrpassword");
    await db.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      "hr_user",
      hrPassword,
      "hr",
    ]);

    // Create Employees
    for (let i = 1; i <= 10; i++) {
      const empPassword = await hashPassword(`employee${i}pass`);
      const [result] = await db.execute(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [`employee${i}`, empPassword, "employee"]
      );

      const userId = (result as any).insertId;

      // Create Employee Records
      await db.execute("INSERT INTO employees (user_id, name, birthdate) VALUES (?, ?, ?)", [
        userId,
        `Employee ${i}`,
        `199${i % 10}-0${(i % 9) + 1}-15`,
      ]);
    }

    console.log("✅ Seeding completed!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await db.end();
    process.exit();
  }
};

seedDatabase();
