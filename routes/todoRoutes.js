import express from "express";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

import Todo from "../models/Todo.js";
import Blacklist from "../models/Blacklist.js";
import { todoSchema } from "../utils/validationSchemas.js";

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

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find();
    return res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({ id: id });

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  const { error } = todoSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { task, completed } = req.body;
    if (!task) return res.status(400).json({ message: "Task cannot be empty" });

    const newTodo = new Todo({
      id: nanoid(12),
      task,
      completed: completed || false,
    });

    const isTodoExist = await Todo.findOne({ id: newTodo.id });
    if (isTodoExist)
      return res.status(500).json({ message: "System Generated Duplicate ID" });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  const { error } = todoSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { id } = req.params;
    const { task, completed } = req.body;
    if (!task) return res.status(400).json({ message: "Task cannot be empty" });

    const updatedTodo = await Todo.findOneAndUpdate(
      { id: id },
      { task, completed },
      { new: true }
    );

    if (!updatedTodo)
      return res.status(404).json({ message: "Todo not found" });
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await Todo.findOneAndDelete(id);
    if (!deletedTodo)
      return res.status(404).json({ message: "Todo not found" });

    res.status(200).json({ message: "Todo is successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
