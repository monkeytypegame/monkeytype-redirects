import { Router } from "express";
import { getConfigByUUID, getConfigs, getRedirectStats } from "../mongo";
import { validateParams } from "../middlewares/validate";
import { z } from "zod";

const router = Router();

// Serve static files for the frontend dashboard
router.get("/configs", async (req, res) => {
  const configs = (await getConfigs()) ?? [];

  res.status(200).json({
    message: "Configs retrieved successfully",
    configs,
  });
});

const uuidParamsSchema = z.object({
  uuid: z.string().uuid(),
});

router.get(
  "/configs/:uuid",
  validateParams(uuidParamsSchema),
  async (req, res) => {
    const { uuid } = req.params;
    const config = await getConfigByUUID(uuid);
    if (!config) {
      res.status(404).json({
        message: `Config ${uuid} not found`,
      });
      return;
    }
    res.status(200).json({
      message: "Config retrieved successfully",
      config,
    });
  }
);

router.get(
  "/stats/:uuid",
  validateParams(uuidParamsSchema),
  async (req, res) => {
    const { uuid } = req.params;
    const config = await getRedirectStats(uuid);
    if (!config) {
      res.status(404).json({
        message: `Stats for ${uuid} not found`,
      });
      return;
    }
    res.status(200).json({
      message: "Stats retrieved successfully",
      config,
    });
  }
);

export default router;
