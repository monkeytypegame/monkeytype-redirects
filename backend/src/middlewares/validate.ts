import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import jwt from "jsonwebtoken";
import logger from "../logger";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid bearer header");
      res.status(401).json({ message: "Missing or invalid bearer header" });
      return;
    }
    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      (req as any).user = payload;
      logger.info(`Auth success for user ${(payload as any).username}`);
      next();
    } catch (e) {
      console.log(e);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  };
}

export function validateParams(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        message: "Invalid URL parameters",
        errors: result.error.errors,
      });
      return; // Ensure nothing is returned except void
    }
    req.params = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        message: "Invalid query parameters",
        errors: result.error.errors,
      });
      return;
    }
    req.query = result.data;
    next();
  };
}

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Invalid request body",
        errors: result.error.errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
