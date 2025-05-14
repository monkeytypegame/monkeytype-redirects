import { Router } from "express";
import logger from "../logger";
import UI from "./ui";
import REDIRECT from "./redirect";
import API from "./api";

const router = Router();

router.get("/", (req, res) => {
  logger.info("Health check route hit");
  res.status(200).json({
    message: "monkeytype-redirects",
  });
});

export function registerRoutes(app: Router) {
  logger.info("Registering all routes");

  app.use((req, res, next) => {
    logger.debug("Request received", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString(),
    });
    next();
  });

  app.use("/", router);
  app.use("/ui", UI);
  app.use("/redirect", REDIRECT);
  app.use("/api", API);
}
