import { Router } from "express";
import { authRequired } from "../utils/auth.mjs";
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  createItinerary,
  getItineraries,
  updateItinerary,
  deleteItinerary,
} from "../controllers/tripsController.mjs";
const r = Router();
r.use(authRequired);
r.post("/", createTrip);
r.get("/", getTrips);
r.get("/:id", getTrip);
r.put("/:id", updateTrip);
r.delete("/:id", deleteTrip);
r.post("/:tripId/itineraries", createItinerary);
r.get("/:tripId/itineraries", getItineraries);
r.put("/:tripId/itineraries/:itId", updateItinerary);
r.delete("/:tripId/itineraries/:itId", deleteItinerary);
export default r;
