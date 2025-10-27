import mongoose from "mongoose";
const S = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    startDate: Date,
    endDate: Date,
    budget: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model("Trip", S);
