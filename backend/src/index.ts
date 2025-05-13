// backend/server.js
import express from "express";
import { connectToMongo } from "./mongo";
import { registerRoutes } from "./routes";

const app = express();
const port = process.env.PORT || 3000;
const mode = process.env.MODE || "DEV";

function boot() {
  console.log("Booting up...");
  // Add any additional boot logic here
  console.log("Connecting to MongoDB...");
  connectToMongo()
    .then(() => console.log("MongoDB connection initialized"))
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
      process.exit(1); // Exit if MongoDB connection fails
    });

  console.log("Registering routes...");
  registerRoutes(app);

  console.log("Starting server...");
  app.listen(port, () => {
    console.log(`App listening on port ${port}, mode: ${mode}`);
  });
}
boot();
