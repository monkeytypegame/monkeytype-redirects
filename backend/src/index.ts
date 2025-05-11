// backend/server.js
import express from "express";
import path from "path";
import { connectToMongo, logHostnameWithDate } from "./mongo";

const app = express();
const port = process.env.PORT || 3000;
const mode = process.env.MODE || "DEV";

// Connect to MongoDB when server starts
connectToMongo()
  .then(() => console.log("MongoDB connection initialized"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Middleware for handling redirect logic based on the domain
app.use((req, res, next) => {
  const host = "redirects." + (mode === "DEV" ? "localhost" : "monkeytype.com");
  if (req.hostname === host) {
    // Serve the frontend dashboard for `redirects` subdomain
    next();
    return;
  }

  if (req.path.includes(".") || req.method !== "GET") {
    // If the request is not a GET request, skip the redirect logic
    res.sendStatus(404);
    return;
  }

  // Log the hostname to MongoDB
  logHostnameWithDate(req.hostname).catch((err) =>
    console.error("Failed to log hostname:", err)
  );

  if (mode === "DEV") {
    //respond with json
    res.status(200).json({
      message: "This will redirect to monkeytype in prod mode.",
    });
  } else {
    res.redirect(301, `https://monkeytype.com`);
  }
});

// Catch-all route to handle frontend routing (React/Vue/Svelte SPA)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
