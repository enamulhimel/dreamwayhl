// routes/blogRoutes.js
import express from "express";
const router = express.Router();

// Sample route
router.get("/", (req, res) => {
  res.json({ message: "Blogs route working!" });
});

router.get("/:id", (req, res) => {
  res.json({ blogId: req.params.id });
});

export default router;