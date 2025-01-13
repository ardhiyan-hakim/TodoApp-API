import express from "express";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import Todo from "../models/Todo.js";

const router = express.Router();

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

router.post("/", async (req, res) => {
  const { task, completed } = req.body;
  if (!task) return res.status(400).json({ message: "Task cannot be empty" });

  const newTodo = new Todo({
    id: nanoid(12),
    task,
    completed: completed || false,
  });

  try {
    const isTodoExist = await Todo.findOne({ id: newTodo.id });
    if (isTodoExist)
      return res.status(500).json({ message: "System Generated Duplicate ID" });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  if (!task) return res.status(400).json({ message: "Task cannot be empty" });

  try {
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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTodo = await Todo.findOneAndDelete(id);
    if (!deletedTodo)
      return res.status(404).json({ message: "Todo not found" });

    res.status(200).json({ message: "Todo is successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
