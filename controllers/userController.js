import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { userSchema } from "../utils/validationSchemas.js";
import Blacklist from "../models/Blacklist.js";

const registerUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });

    if (userExists)
      return res.status(400).json({ message: "Username is unavailable" });

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

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
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token not provided" });

    const decoded = jwt.decode(token);
    if (!decoded)
      return res.status(400).json({ message: "Token not provided" });

    const expirationTime = decoded.exp * 1000;

    await Blacklist.create({ token, expiresAt: expirationTime });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error Logging Out", error: err.message });
  }
};

export { registerUser, loginUser, logoutUser };
