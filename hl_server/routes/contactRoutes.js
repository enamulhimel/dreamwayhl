// routes/contactRoutes.js
import express from "express";
const router = express.Router();

// POST /contact - Handle contact form
router.post("/", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // TODO: Save to DB or send email
  console.log("Contact form:", { name, email, message });

  res.json({ success: true, message: "Thank you! We'll get back to you soon." });
});

// GET /contact - Test route
router.get("/", (req, res) => {
  res.json({ message: "Contact route is working!" });
});

// MUST HAVE: export default
export default router;