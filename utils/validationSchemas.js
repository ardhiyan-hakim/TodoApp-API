import Joi from "joi";

const todoSchema = Joi.object({
  task: Joi.string().min(3).max(60).required(),
  completed: Joi.boolean().default(false),
});

const userSchema = Joi.object({
  username: Joi.string().min(6).max(30).required(),
  password: Joi.string().min(8).required(),
});

export { todoSchema, userSchema };
