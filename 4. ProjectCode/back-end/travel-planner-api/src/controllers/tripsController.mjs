import Trip from "../models/Trip.mjs";
import Itinerary from "../models/Itinerary.mjs";
export async function createTrip(req, res) {
  const { name, startDate, endDate, budget = 0 } = req.body || {};
  if (!name || !startDate || !endDate)
    return res.status(400).json({ error: "name, startDate, endDate required" });
  const trip = await Trip.create({
    userId: req.user.id,
    name,
    startDate,
    endDate,
    budget,
  });
  res.status(201).json(trip);
}
export async function getTrips(req, res) {
  const trips = await Trip.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(trips);
}
export async function getTrip(req, res) {
  const t = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
  if (!t) return res.status(404).json({ error: "not found" });
  res.json(t);
}
export async function updateTrip(req, res) {
  const t = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!t) return res.status(404).json({ error: "not found" });
  res.json(t);
}
export async function deleteTrip(req, res) {
  const t = await Trip.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!t) return res.status(404).json({ error: "not found" });
  await Itinerary.deleteMany({ tripId: t._id });
  res.json({ ok: true });
}
export async function createItinerary(req, res) {
  const { day, notes, activities = [], destination = "" } = req.body || {};
  if (!day) return res.status(400).json({ error: "day required" });
  const it = await Itinerary.create({
    tripId: req.params.tripId,
    day,
    notes,
    activities,
    destination,
  });
  res.status(201).json(it);
}
export async function getItineraries(req, res) {
  const list = await Itinerary.find({ tripId: req.params.tripId }).sort({
    day: 1,
  });
  res.json(list);
}
export async function updateItinerary(req, res) {
  const it = await Itinerary.findOneAndUpdate(
    { _id: req.params.itId, tripId: req.params.tripId },
    req.body,
    { new: true }
  );
  if (!it) return res.status(404).json({ error: "not found" });
  res.json(it);
}
export async function deleteItinerary(req, res) {
  const it = await Itinerary.findOneAndDelete({
    _id: req.params.itId,
    tripId: req.params.tripId,
  });
  if (!it) return res.status(404).json({ error: "not found" });
  res.json({ ok: true });
}
