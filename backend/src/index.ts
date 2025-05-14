// backend/server.js
import express from "express";
import { connectToMongo } from "./mongo";
import { registerRoutes } from "./routes";
import logger from "./logger";
import cors from "cors";
import helmet from "helmet";
import { globalRateLimiter } from "./middlewares/rateLimit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(globalRateLimiter);

const port = process.env.PORT || 3000;
const prodMode = process.env.NODE_ENV === "production";

function boot() {
  logger.info("Booting up...");

  if (prodMode && !process.env.JWT_SECRET) {
    logger.error("JWT_SECRET is not set in production mode");
    process.exit(1);
  }

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
