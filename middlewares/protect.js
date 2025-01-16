import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";

const protect = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "No token provided, access denied" });

  const blacklistedToken = await Blacklist.findOne({ token });
  if (blacklistedToken)
    return res.status(401).json({ message: "Token is invalid or logged out" });

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired. Please re-login" });
    }

    res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;