import { Router } from "express";
import { getConfigByUUID, getConfigs } from "../mongo";
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

const ConfigsUUIDSchema = z.object({
  uuid: z.string().uuid(),
});

router.get(
  "/configs/:uuid",
  validateParams(ConfigsUUIDSchema),
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

export default router;
