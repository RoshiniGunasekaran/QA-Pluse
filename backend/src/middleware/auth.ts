import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/authService";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      success: false,
      error: "No token provided",
    });
    return;
  }

  if (!authorization.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
    return;
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
    return;
  }

  try {
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
}