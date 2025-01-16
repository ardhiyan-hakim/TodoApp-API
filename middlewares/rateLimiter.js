import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 150,
  message: "Maximum request exceeded. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;
