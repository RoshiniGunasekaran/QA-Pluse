import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: number;
  email: string;
}

const SALT_ROUNDS = 10;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(userId: number, email: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const payload: TokenPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "number" ||
      typeof decoded.email !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch {
    throw new Error("Invalid or expired token");
  }
}