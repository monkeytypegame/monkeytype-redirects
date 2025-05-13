import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

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
