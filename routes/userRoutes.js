import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "User already exist" });
    }

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Please enter the correct username and password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token not provided" });

  try {
    const decoded = jwt.decode(token);
    if (!decoded)
      return res.status(400).json({ message: "Token not provided" });

    const expirationTime = new Date(decoded.exp * 1000);

    await Blacklist.create({ token, expiresAt: expirationTime });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error logging out", error: err.message });
  }
});

export default router;
