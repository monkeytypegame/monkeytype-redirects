import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

const getKey = (req: Request, _res: Response): string => {
  return (
    (req.headers["cf-connecting-ip"] as string) ||
    (req.headers["x-forwarded-for"] as string) ||
    (req.ip as string) ||
    "255.255.255.255"
  );
};

export const globalRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: getKey,
});
