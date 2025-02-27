import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import authRoutes from "./routes/authRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import db from "./config/db";

dotenv.config();

const app = express();

async function testDatabaseConnection(retryCount = 0) {
  try {
      const connection = await db.getConnection();
      const [rows] = await connection.execute('SELECT DATABASE()');
      connection.release();
      console.log('Database connection test:', rows);
  } catch (error: any) {
      if (error.code === 'EAI_AGAIN' && retryCount < 3) { // Retry up to 3 times
          console.log(`Retry database connection (${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)); // Exponential backoff
          await testDatabaseConnection(retryCount + 1);
      } else {
          console.error('Database connection test failed:', error);
      }
  }
}

// Call this function when your application starts or on a specific route


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

// Handle preflight requests
app.options('*', cors());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/api", employeeRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  testDatabaseConnection();
});
