import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();
dotenv.config();

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 100,
  max: 150,
  message: "Maximum request exceeded. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/todos", todoRoutes);
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.send("Welcome to the Todo App API!");
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Connecting Mongoose to MongoDB
mongoose
  .connect(`mongodb://localhost:${process.env.MONGO_URI}/todoapp`)
  .then(() => {
    console.log(`Connected to MongoDB at localhost:${process.env.MONGO_URI}`);
    app.listen(process.env.PORT, () => {
      console.log(
        `Server is currently running at http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((err) => console.log("Could not connect to MongoDB...", err));
