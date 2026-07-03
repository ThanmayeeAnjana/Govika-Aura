import type { NextFunction, Request, Response } from "express";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAdmin) {
    next();
    return;
  }
  res.status(401).json({ error: "Not authenticated" });
}
