import express from "express";
import jwt from "jsonwebtoken";

import Todo from "../models/Todo.js";
import Blacklist from "../models/Blacklist.js";
import { todoSchema } from "../utils/validationSchemas.js";
import {
  getTodo,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";

const router = express.Router();

const protect = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "No token provided, access denied" });

  const blacklistedToken = await Blacklist.findOne({ token });
  if (blacklistedToken) {
    return res.status(401).json({ message: "Token is invalid or logged out" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired. Please re-login" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/", getTodo);

router.get("/:id", getTodoById);

router.post("/", protect, createTodo);

router.put("/:id", protect, updateTodo);

router.delete("/:id", protect, deleteTodo);

export default router;
