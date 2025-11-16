// routes/reviewRoutes.js
import express from 'express';
import con from '../config/db.js';  // ← Must be ESM too!

const router = express.Router();

// GET: All reviews (limit 12)
router.get('/review', (req, res) => {
  con.query("SELECT * FROM review LIMIT 12", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database Error" });
    }
    res.json(result);
  });
});

// MUST HAVE: export default
export default router;