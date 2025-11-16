// middleware/apiKeyAuth.js
const publicRoutes = [
  "/",
  "/test-db",
  "/properties",
  "/reviews",
  "/blogs",
  "/contact",
  "/api"
];

const apiKeyAuth = (req, res, next) => {
  // Allow public routes
  if (publicRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  const clientKey = req.headers["x-api-key"];
  const expectedKey = process.env.SERVER_API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  if (!clientKey) {
    return res.status(401).json({ message: "API key missing" });
  }

  if (clientKey !== expectedKey) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next();
};

// MUST USE: export default
export default apiKeyAuth;