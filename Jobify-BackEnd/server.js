import "express-async-errors";
import * as dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import cors from "cors";

//router
import jobRouter from "./routes/jobRouter.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRouter.js";

// public
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

// middleware
import errorHandleMiddleware from "./middleware/ErrorHandleMiddleware.js";
import { authenticateUser } from "./middleware/authMiddleware.js";

const app = express();
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, "./public")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // This allows credentials (cookies) to be sent
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/test", (req, res) => {
  res.json({ msg: "test route" });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/v2/test", (req, res) => {
  const { name } = req.body;
  res.status(200).json({ msg: `hello ${name}` });
});

app.use("/api/v1/jobs", authenticateUser, jobRouter);
app.use("/api/v1/users", authenticateUser, userRouter);
app.use("/api/v1/auth", authRouter);

// not found and error middleware

//In summary, the "not found" middleware is specifically designed to handle requests
//for non-existent routes, while the "error" middleware is a catch-all for handling
// unexpected errors that occur during request processing.

//not found
app.use("*", (req, res) => {
  res.status(404).json({ msg: "not fount" });
});

// error middleware
app.use(errorHandleMiddleware);
// connection port and connection db
const port = process.env.PORT || 4200;
try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}....`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
