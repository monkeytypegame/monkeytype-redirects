import { Router } from "express";
import UI from "./ui";
import REDIRECT from "./redirect";
import API from "./api";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "monkeytype-redirects",
  });
});

export function registerRoutes(app: Router) {
  app.use("/", router);
  app.use("/ui", UI);
  app.use("/redirect", REDIRECT);
  app.use("/api", API);
}
