import { Router } from "express";
import { getConfigByUUID, getConfigs } from "../mongo";

const router = Router();

// Serve static files for the frontend dashboard
router.get("/configs", async (req, res) => {
  const configs = (await getConfigs()) ?? [];

  res.status(200).json({
    message: "Configs retrieved successfully",
    configs,
  });
});

router.get("/configs/:uuid", async (req, res) => {
  const { uuid } = req.params;
  const config = await getConfigByUUID(uuid);
  if (!config) {
    res.status(404).json({
      message: "Config not found",
    });
    return;
  }
  res.status(200).json({
    message: "Config retrieved successfully",
    config,
  });
});

export default router;
