import jwt from "jsonwebtoken";
import User from "../models/User.mjs";
import { hashPassword, verifyPassword } from "../utils/password.mjs";

export async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, password required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: "email already registered" });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  return res
    .status(201)
    .json({ id: user._id, name: user.name, email: user.email });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email, password required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );

  return res.json({ token });
}
