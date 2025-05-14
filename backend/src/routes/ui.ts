import { Router } from "express";
import path from "path";
import express from "express";

const router = Router();

const distPath = path.join(__dirname, "../../../frontend/dist");

// Serve static files for the frontend dashboard
router.use(express.static(distPath));

// Serve index.html for the root path (SPA fallback)
router.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

export default router;
