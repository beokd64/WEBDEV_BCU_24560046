import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import apiDocsRoutes from "./routes/apiDocs.js";
import aiRoutes from "./routes/ai.js"; // ⬅ new secure AI route

dotenv.config();
connectDB();

const app = express();

// CORS – allow your deployed frontend (and localhost if you want to test)
const allowedOrigins = [
  "https://my-frontend-2xtv.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/docs", apiDocsRoutes);
app.use("/api/ai", aiRoutes); // ⬅ frontend calls this, server talks to OpenAI

// Simple health check
app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
