// backend/server.js
import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;
const mode = process.env.MODE || "DEV";

// Middleware for handling redirect logic based on the domain
app.use((req, res, next) => {
  const host = "redirects." + (mode === "DEV" ? "localhost" : "monkeytype.com");
  if (req.hostname === host) {
    // Serve the frontend dashboard for `redirects` subdomain
    next();
  } else {
    console.log(`Redirecting from ${req.hostname}`);

    if (mode === "DEV") {
      //respond with json
      res.status(200).json({
        message: "This is the development mode. Redirects are not available.",
      });
      return;
    }

    // Log and redirect for typo domains
    res.redirect(301, `https://monkeytype.com`);
  }
});

// Catch-all route to handle frontend routing (React/Vue/Svelte SPA)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
