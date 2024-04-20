import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

// Import Routes
import userRouter from "./routes/user.router.js";

//Route Declaration
app.use("/api/v1/users", userRouter);

// https://localhost:8000/api/v1/users/register

export { app };
