import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../src/models/User.mjs";
import Trip from "../src/models/Trip.mjs";
import Itinerary from "../src/models/Itinerary.mjs";
dotenv.config();
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/travelplanner";
await mongoose.connect(uri);
await User.deleteMany({ email: "demo@demo.com" });
const hash = await bcrypt.hash("Demo1234", 10);
const user = await User.create({
  name: "Demo",
  email: "demo@demo.com",
  passwordHash: hash,
});
const trip = await Trip.create({
  userId: user._id,
  name: "Quito Express",
  startDate: new Date(),
  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  budget: 500,
});
await Itinerary.create({
  tripId: trip._id,
  day: 1,
  notes: "Centro Histórico",
  activities: ["Plaza Grande", "Basílica"],
  destination: "Quito",
});
await Itinerary.create({
  tripId: trip._id,
  day: 2,
  notes: "Mitad del Mundo",
  activities: ["Museo Intiñan"],
  destination: "Quito",
});
console.log("Seed lista: demo@demo.com / Demo1234");
await mongoose.disconnect();
