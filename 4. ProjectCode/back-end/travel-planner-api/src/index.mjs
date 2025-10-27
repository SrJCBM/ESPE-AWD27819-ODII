import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.mjs";
import tripRoutes from "./routes/trips.mjs";
import integrationRoutes from "./routes/integrations.mjs";
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.set("json spaces", 2);
const PORT = process.env.PORT || 8080;
const URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/travelplanner";
try {
  await mongoose.connect(URI);
  console.log("MongoDB conectado");
} catch (e) {
  console.error("MongoDB error", e.message);
}
app.get("/health", (req, res) =>
  res.json({ ok: true, service: "travel-planner-api" })
);
app.use("/auth", authRoutes);
app.use("/trips", tripRoutes);
app.use("/integrations", integrationRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});
app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
