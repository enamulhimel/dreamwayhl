// server.js
import router from "./routes/apiKeyRoute.js";
import dotenv from "dotenv";
import express from "express";
import apiKeyAuth from "./middleware/apiKeyAuth.js";
import propertyRoutes from './routes/propertyRoutes.js';
import reviewRoutes from "./routes/reviewRoutes.js";
import blogRoutes from './routes/blogRoutes.js';
import contactRoutes from './routes/contactRoutes.js'
import cors from 'cors'

dotenv.config();
const app = express();



// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Auth Middleware
app.use(apiKeyAuth);

// Routes
app.use('/', propertyRoutes);
app.use('/', reviewRoutes);
app.use('/', blogRoutes);
app.use('/', contactRoutes);
app.use("/api", router);

// Test
app.get('/', (req, res) => res.json({ message: 'API Running', status: 'ok' }));
app.get('/test-db', (req, res) => res.json({ success: true }));
app.get("/secure-data", apiKeyAuth, (req, res) => {
  res.json({ message: "You accessed protected data!" });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});