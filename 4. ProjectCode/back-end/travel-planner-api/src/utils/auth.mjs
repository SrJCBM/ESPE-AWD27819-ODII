import jwt from "jsonwebtoken";
export function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: "Missing Bearer token" });
  try {
    const p = jwt.verify(t, process.env.JWT_SECRET || "devsecret");
    req.user = { id: p.id, email: p.email };
    next();
  } catch (e) {
    // Only handle JWT errors, let other exceptions propagate
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    throw e;
  }
}
