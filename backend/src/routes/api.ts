import { Router } from "express";
import {
  addConfig,
  getConfigByUUID,
  getConfigs,
  getRedirectStats,
} from "../mongo";
import { validateBody, validateParams } from "../middlewares/validate";
import { z } from "zod";
import logger from "../logger";

const router = Router();

// Serve static files for the frontend dashboard
router.get("/configs", async (req, res) => {
  const configs = (await getConfigs()) ?? [];
  logger.info(`Retrieved ${configs.length} configs`);

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
      logger.warn(`Config ${uuid} not found`);
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

const createConfigSchema = z.object({
  source: z.string().regex(/^\w+\.\w+$/),
  target: z.string().url(),
});

router.post("/configs", validateBody(createConfigSchema), async (req, res) => {
  const { source, target } = req.body;

  try {
    await addConfig(source, target);
    logger.info("Config created", { source, target });
    res.status(201).json({
      message: "Config created successfully",
      config: { source, target },
    });
    return;
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      logger.warn("Config already exists", { source });
      res.status(409).json({
        message: "Config already exists",
      });
      return;
    }

    throw error;
  }
});

router.get(
  "/stats/:uuid",
  validateParams(uuidParamsSchema),
  async (req, res) => {
    const { uuid } = req.params;
    const config = await getRedirectStats(uuid);
    if (!config) {
      logger.warn(`Stats for ${uuid} not found`);
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

router.get("/ui-data", async (req, res) => {
  const configs = (await getConfigs()) ?? [];
  const stats = await Promise.all(
    configs.map(async (config) => {
      const stat = await getRedirectStats(config.uuid);
      return {
        ...config,
        stats: stat,
      };
    })
  );

  res.status(200).json({
    message: "UI data retrieved successfully",
    stats,
  });
});

export default router;
