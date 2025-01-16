import { nanoid } from "nanoid";

import Todo from "../models/Todo.js";
import { todoSchema } from "../utils/validationSchemas.js";

const getTodo = async (req, res) => {
  try {
    const todos = await Todo.find();
    return res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOne({ id: id });

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    return res.json(todo);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createTodo = async (req, res) => {
  const { error } = todoSchema.validate(req.body);
  if (error) return res.status(401).json({ message: error.details[0].message });

  try {
    const { task, completed } = req.body;

    const newTodo = new Todo({
      id: nanoid(12),
      task,
      completed: completed || false,
      user: req.user.id,
    });

    const isExist = await Todo.findOne({ id: newTodo.id });
    if (isExist)
      return res.status(500).json({ message: "System Generated Duplicate ID" });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTodo = async (req, res) => {
  const { error } = todoSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { id } = req.params;
    const { task, completed } = req.body;

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
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await Todo.findOneAndDelete({ id: id });
    if (!deletedTodo)
      return res.status(404).json({ message: "Todo not found" });

    res.status(200).json({ message: "Todo is successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getTodo, getTodoById, createTodo, updateTodo, deleteTodo };
