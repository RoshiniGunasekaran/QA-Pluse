import express, { Request, Response } from "express";
import { Pool } from "pg";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from "../services/authService";

const router = express.Router();

const pool = new Pool({
  user: "dev",
  password: "devpass",
  host: "localhost",
  port: 5432,
  database: "qa_pulse",
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Email, password and name are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Email already registered",
      });
    }

    const passwordHash = hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];

    const token = generateToken(user.id, user.email);

    return res.status(201).json({
      success: true,
      token,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to register user",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash, name FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordValid = verifyPassword(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user.id, user.email);

    return res.json({
      success: true,
      token,
      userId: user.id,
      name: user.name,
    });
  } catch (error: any) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to login",
    });
  }
});

// GET /api/auth/profile
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization token required",
      });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authorization token required",
      });
    }

    const decoded = verifyToken(token);

    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("Profile error:", error);

    return res.status(401).json({
      success: false,
      error: error.message || "Invalid or expired token",
    });
  }
});

export default router;