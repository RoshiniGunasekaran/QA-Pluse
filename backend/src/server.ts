import express, {
  Application,
  Request,
  Response,
  NextFunction,
} from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

console.log(
  "GITHUB_TOKEN:",
  process.env.GITHUB_TOKEN
    ? "✅ EXISTS"
    : "❌ MISSING"
);

console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET
    ? "✅ EXISTS"
    : "❌ MISSING"
);

// ================================
// Import Routes
// ================================

import testRunsRouter from "./routes/testRuns";
import testResultsRouter from "./routes/testResults";
import healthRouter from "./routes/health";
import dashboardRouter from "./routes/dashboard";
import riskAnalysisRouter from "./routes/riskAnalysis";
import githubRouter from "./routes/github";
import authRouter from "./routes/auth";
import orgsRouter from "./routes/orgs";
import slackRouter from "./routes/slack";

// ================================
// Authentication Middleware
// ================================

import { authMiddleware } from "./middleware/auth";

const app: Application = express();

const PORT: number = parseInt(
  process.env.PORT || "5000",
  10
);

// ================================
// Global Middleware
// ================================

app.use(express.json());

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ================================
// Public Routes
// ================================

// Health check remains public
app.use("/health", healthRouter);

// Login / Signup routes remain public
app.use("/api/auth", authRouter);

// ================================
// Organization Routes
// ================================

// Organization routes already use authMiddleware
// inside routes/orgs.ts
app.use("/api/orgs", orgsRouter);

// ================================
// Protected Routes
// ================================

// All routes below require a valid JWT

app.use(
  "/api/test-runs",
  authMiddleware,
  testRunsRouter
);

app.use(
  "/api/test-results",
  authMiddleware,
  testResultsRouter
);

app.use(
  "/api/dashboard",
  authMiddleware,
  dashboardRouter
);

app.use(
  "/api/risk",
  authMiddleware,
  riskAnalysisRouter
);

app.use(
  "/api/github",
  authMiddleware,
  githubRouter
);

// Slack routes
//
// routes/slack.ts already applies
// authMiddleware to its endpoints.
app.use(
  "/api/slack",
  slackRouter
);

// ================================
// 404 Handler
// ================================

app.use(
  (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      timestamp: new Date(),
    });
  }
);

// ================================
// Global Error Handler
// ================================

app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error(
      "Unhandled error:",
      err.message
    );

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: [err.message],
      timestamp: new Date(),
    });
  }
);

// ================================
// Start Server
// ================================

app.listen(PORT, (): void => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});