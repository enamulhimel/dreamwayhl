// routes/propertyRoutes.js
import express from 'express';
import con from '../config/db.js';  // ← Must also be ESM!

const router = express.Router();

// GET: All properties (public)
router.get('/properties', (req, res) => {
  let query = "SELECT id, name, slug, img_thub, land_area, flat_size, building_type, project_status, location, address FROM properties";
  let params = [];
  let where = [];

  if (req.query.project_status && req.query.project_status !== 'default') {
    where.push("project_status = ?");
    params.push(req.query.project_status);
  }
  if (req.query.location && req.query.location !== 'default') {
    where.push("location = ?");
    params.push(req.query.location);
  }

  if (where.length > 0) {
    query = query.replace("FROM", `FROM properties WHERE ${where.join(" AND ")}`);
  }

  if (req.query.from_homepage === 'true') {
    query += " ORDER BY home_serial ASC LIMIT 9";
  } else {
    query += " ORDER BY home_serial ASC";
  }

  con.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json(result);
  });
});

// GET: Single property by slug (NOW PUBLIC!)
router.get('/sproperties', (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "Slug required" });

  const sql = `
    SELECT p.*, a.*, ag.*
    FROM properties p
    LEFT JOIN amenities a ON p.id = a.id
    LEFT JOIN agent ag ON p.agent_id = ag.id
    WHERE p.slug = ?
  `;

  con.query(sql, [slug], (err, result) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json(result);
  });
});

// GET: Similar properties
router.get('/similar', (req, res) => {
  const { slug, flat_size } = req.query;
  if (!slug || !flat_size) return res.status(400).json({ error: "Missing params" });

  con.query(
    `SELECT id, name, slug, img_thub, land_area, flat_size, building_type, project_status, location, address 
     FROM properties 
     WHERE slug != ? 
     ORDER BY ABS(flat_size - ?) 
     LIMIT 3`,
    [slug, flat_size],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB Error" });
      res.json(result);
    }
  );
});

// MUST HAVE: export default
export default router;