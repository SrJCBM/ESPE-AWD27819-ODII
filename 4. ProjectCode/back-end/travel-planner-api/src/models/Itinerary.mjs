import mongoose from "mongoose";
const S = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    day: Number,
    notes: String,
    activities: [String],
    destination: String,
  },
  { timestamps: true }
);
export default mongoose.model("Itinerary", S);
