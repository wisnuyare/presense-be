import fs from "fs";
import db from "../src/config/db";

const runMigration = async () => {
  try {
    console.log("Running migration...");

    const sql = fs.readFileSync("./src/migration/schema.sql", "utf8");
    console.log("SQL script read successfully.");

    await db.query(sql);
    console.log("Migration completed successfully!");
  } catch (error: any) {
    console.error("Migration failed:", error.sqlMessage || error);
  } finally {
    await db.end();
  }
};


runMigration();
