import mongoose from "mongoose";
const S = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    passwordHash: String,
  },
  { timestamps: true }
);
export default mongoose.model("User", S);
