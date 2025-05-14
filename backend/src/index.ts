// backend/server.js
import express from "express";
import { connectToMongo } from "./mongo";
import { registerRoutes } from "./routes";
import logger from "./logger";

const app = express();
const port = process.env.PORT || 3000;
const prodMode = process.env.NODE_ENV === "production";

function boot() {
  logger.info("Booting up...");
  // Add any additional boot logic here
  logger.info("Connecting to MongoDB...");
  connectToMongo()
    .then(() => logger.info("MongoDB connection initialized"))
    .catch((err) => {
      logger.error("Failed to connect to MongoDB:", err);
      process.exit(1); // Exit if MongoDB connection fails
    });

  logger.info("Registering routes...");
  registerRoutes(app);

  logger.info("Starting server...");
  app.listen(port, () => {
    logger.info(
      `App listening on port ${port}, mode: ${prodMode ? "PROD" : "DEV"}`
    );
  });
}
boot();
