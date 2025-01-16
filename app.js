import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import limiter from "./middlewares/rateLimiter.js";

const app = express();
dotenv.config();

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/todos", todoRoutes);
app.use(limiter);

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
