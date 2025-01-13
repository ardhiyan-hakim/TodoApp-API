import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: String, required: true },
});

blacklistSchema.index({ expiresAt: 1 }, { expiresAfterSeconds: 0 });
const Blacklist = mongoose.model("Blacklist", blacklistSchema);

export default Blacklist;