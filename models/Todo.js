import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

todoSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.$__;
    delete ret.$options;
    delete ret.$locals;
    delete ret.$isNew;

    return ret;
  },
});

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
