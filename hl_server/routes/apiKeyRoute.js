import express from "express";
import { generateApiKey } from "../utils/generateApiKey.js";

const router = express.Router();

router.get("/create-api-key", (req, res) => {
  const apiKey = generateApiKey();
  res.json({ apiKey });
});

export default router;
