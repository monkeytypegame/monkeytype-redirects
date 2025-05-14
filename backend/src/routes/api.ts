import { Router } from "express";
import {
  addConfig,
  getConfigByUUID,
  getConfigs,
  getRedirectStats,
  createUser,
  findUserByUsername,
} from "../mongo";
import { validateBody, validateParams } from "../middlewares/validate";
import { z } from "zod";
import logger from "../logger";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authenticateWithBearer } from "../middlewares/authenticate";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const prodMode = process.env.NODE_ENV === "production";

const router = Router();

// Serve static files for the frontend dashboard
router.get("/configs", authenticateWithBearer(), async (req, res) => {
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
  authenticateWithBearer(),
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

router.post(
  "/configs",
  validateBody(createConfigSchema),
  authenticateWithBearer(),
  async (req, res) => {
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
  }
);

router.get(
  "/stats/:uuid",
  validateParams(uuidParamsSchema),
  authenticateWithBearer(),
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

router.get("/ui-data", authenticateWithBearer(), async (req, res) => {
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

const authSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

router.post("/register", validateBody(authSchema), async (req, res) => {
  if (prodMode) {
    logger.warn("Register endpoint is disabled in production");
    res.status(403).json({
      message: "Register endpoint is disabled in production",
    });
    return;
  }
  const { username, password } = req.body;

  const user = await findUserByUsername(username);
  if (user) {
    logger.warn(`Register failed for ${username}: user already exists`);
    res.status(409).json({
      message: "User already exists",
    });
    return;
  }

  await createUser(username, password);
  logger.info(`User registered: ${username}`);
  res.status(201).json({ message: "User registered" });
});

router.post("/login", validateBody(authSchema), async (req, res) => {
  const { username, password } = req.body;

  const user = await findUserByUsername(username);

  if (!user) {
    logger.warn(`Login failed for ${username}: user not found`);
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const [salt, storedHash] = user.passwordHash.split(":");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  const valid = hash === storedHash;
  if (!valid) {
    logger.warn(`Invalid password for user: ${username}`);
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ username, id: user!._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  logger.info(`User logged in: ${username}`);
  res.json({ token });
});

router.get(
  "/test-redirect/:uuid",
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

    logger.info(`Testing redirect for ${uuid}`, {
      source: config.source,
      target: config.target,
    });

    const portOnDev = process.env.NODE_ENV === "production" ? "" : ":3000";

    let httpError = "";
    const httpController = new AbortController();
    const httpTimeout = setTimeout(() => httpController.abort(), 3000);
    const httpGood = await fetch(
      `http://${config.source}${portOnDev}/redirect`,
      {
        headers: {
          "x-monkeytype-redirects-test": "true",
        },
        signal: httpController.signal,
      }
    )
      .then(async (response) => {
        clearTimeout(httpTimeout);
        //make sure to remove trailing slashes
        const responseUrl = response.url.replace(/\/+$/, "");
        const targetUrl = config.target.replace(/\/+$/, "");
        if (
          response.redirected === true &&
          response.status === 200 &&
          responseUrl === targetUrl
        ) {
          return true;
        }
        logger.warn(
          `Redirect test failed for ${uuid}: redirected - ${response.redirected} status - ${response.status} url - ${response.url}`
        );
        if (response.redirected === false) {
          httpError = `Request was not redirected`;
          return false;
        }
        if (response.status !== 200) {
          httpError = `Request returned status ${response.status}`;
          return false;
        }
        if (responseUrl !== targetUrl) {
          httpError = `Request returned url ${responseUrl} instead of ${targetUrl}`;
          return false;
        }
        return false;
      })
      .catch((e) => {
        clearTimeout(httpTimeout);
        logger.error(`HTTP redirect test failed for ${uuid}`);
        logger.error("Error", e);
        if (e.name === "AbortError") {
          httpError = "Request timed out";
        } else {
          httpError = e.cause?.code || "Request failed";
        }
        return false;
      });

    let httpsError = "";
    const httpsController = new AbortController();
    const httpsTimeout = setTimeout(() => httpsController.abort(), 3000);
    const httpsGood = await fetch(
      `https://${config.source}${portOnDev}/redirect`,
      {
        headers: {
          "x-monkeytype-redirects-test": "true",
        },
        signal: httpsController.signal,
      }
    )
      .then(async (response) => {
        clearTimeout(httpsTimeout);
        //make sure to remove trailing slashes
        const responseUrl = response.url.replace(/\/+$/, "");
        const targetUrl = config.target.replace(/\/+$/, "");
        if (
          response.redirected === true &&
          response.status === 200 &&
          responseUrl === targetUrl
        ) {
          return true;
        }
        logger.warn(
          `Redirect test failed for ${uuid}: redirected - ${response.redirected} status - ${response.status} url - ${response.url}`
        );
        if (response.redirected === false) {
          httpsError = `Request was not redirected`;
          return false;
        }
        if (response.status !== 200) {
          httpsError = `Request returned status ${response.status}`;
          return false;
        }
        if (responseUrl !== targetUrl) {
          httpsError = `Request returned url ${responseUrl} instead of ${targetUrl}`;
          return false;
        }
        return false;
      })
      .catch((e) => {
        clearTimeout(httpsTimeout);
        logger.error(`HTTPS redirect test failed for ${uuid}`);
        logger.error("Error", e);
        if (e.name === "AbortError") {
          httpsError = "Request timed out";
        } else {
          httpsError = e.cause?.code || "Request failed";
        }
        return false;
      });

    logger.info(
      `Redirect test complete for ${uuid}: http - ${httpGood} ${httpError} https - ${httpsGood} ${httpsError}`
    );

    res.status(200).json({
      message: "Redirect test complete",
      data: {
        uuid,
        http: {
          result: httpGood,
          error: httpGood ? undefined : httpError,
        },
        https: {
          result: httpsGood,
          error: httpsGood ? undefined : httpsError,
        },
      },
    });
  }
);

export default router;
