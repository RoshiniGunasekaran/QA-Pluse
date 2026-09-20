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
console.log('✅ .env loaded');
console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? '✅ EXISTS' : '❌ MISSING');


// Import routes
import testRunsRouter from "./routes/testRuns";
import testResultsRouter from "./routes/testResults";
import healthRouter from "./routes/health";
import dashboardRouter from "./routes/dashboard";
import riskAnalysisRouter from "./routes/riskAnalysis"; // NEW
import githubRouter from './routes/github';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(express.json());

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Register routes
app.use("/api/test-runs", testRunsRouter);
app.use("/api/test-results", testResultsRouter);
app.use("/health", healthRouter);
app.use("/api/dashboard", dashboardRouter);

// Risk analysis routes
app.use("/api/risk", riskAnalysisRouter);

app.use('/api/github', githubRouter);
// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    timestamp: new Date(),
  });
});

// Global error handling middleware
app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error("Unhandled error:", err.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: [err.message],
      timestamp: new Date(),
    });
  }
);

// Start server
app.listen(PORT, (): void => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});