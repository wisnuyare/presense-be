import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Change this to match your frontend's URL
    credentials: true, // Allow cookies to be sent
  }));
app.use(bodyParser.json());
app.use(cookieParser()); 

// Routes
app.use("/auth", authRoutes);
app.use("/api", employeeRoutes);
app.use("/api", attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
