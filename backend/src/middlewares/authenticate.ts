import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export function authenticateWithBearer() {
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
      next();
    } catch (e) {
      console.log(e);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  };
}
