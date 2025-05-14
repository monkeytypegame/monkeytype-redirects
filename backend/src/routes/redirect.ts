import { Router } from "express";
import { findConfigByHostname, logRedirect } from "../mongo";
import logger from "../logger";

const router = Router();

const prodMode = process.env.NODE_ENV === "production";

// Serve static files for the frontend dashboard
router.get("/", async (req, res) => {
  let hostname = req.hostname;
  if (hostname.startsWith("www.")) {
    hostname = hostname.slice(4);
  }

  const redirect = await findConfigByHostname(hostname);

  if (redirect === null) {
    logger.warn(`No redirect found for hostname: ${hostname}`);
    res.status(404).json({
      message: `No redirect found for hostname: ${hostname}`,
    });
    return;
  }

  await logRedirect(redirect.uuid)
    .then(() => {
      logger.info(`Logged redirect event for ${redirect.uuid}`);
    })
    .catch((err: Error) => {
      logger.error(`Failed to log event for ${redirect.uuid}: ${err.message}`);
      res.status(500).json({
        message: `Failed to log redirect event for ${redirect.uuid}`,
      });
      return;
    });

  logger.info(`Redirecting from ${redirect.source} to ${redirect.target}`);
  if (!prodMode) {
    //respond with json
    res.status(200).json({
      message: `This will redirect to ${redirect.target} when NOT in DEV mode.`,
    });
  } else {
    res.redirect(302, redirect.target);
  }
});

export default router;
