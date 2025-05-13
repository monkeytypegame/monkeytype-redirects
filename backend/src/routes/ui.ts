import { Router } from "express";
import path from "path";
import express from "express";

const router = Router();

// Serve static files for the frontend dashboard
router.get("/", express.static(path.join(__dirname, "../../../frontend/dist")));

export default router;
