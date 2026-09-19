// backend/src/routes/dashboard.ts
import { Router, Request, Response } from "express";
import { DashboardService } from "../services/dashboardService";
import { pool } from "../db";

// Disable caching for all dashboard endpoints
const noCacheMiddleware = (req: Request, res: Response, next: any) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

const router = Router();

// Apply middleware to all routes
router.use(noCacheMiddleware);

/**
 * Utility: format API response
 */
const apiResponse = (
  success: boolean,
  message: string,
  data: any = null,
  errors: string[] = []
) => ({
  success,
  message,
  data,
  errors,
  timestamp: new Date(),
});

/**
 * Validate projectId
 */
const validateProjectId = (req: Request): { valid: boolean; errors: string[]; projectId?: number } => {
  const projectId = Number(req.query.projectId);
  const errors: string[] = [];

  if (!req.query.projectId) {
    errors.push("projectId is required");
  } else if (isNaN(projectId)) {
    errors.push("projectId must be a number");
  } else if (projectId <= 0) {
    errors.push("projectId must be > 0");
  }

  return { valid: errors.length === 0, errors, projectId };
};

/**
 * GET /api/dashboard/summary
 */
router.get("/summary", async (req: Request, res: Response) => {
  const { valid, errors, projectId } = validateProjectId(req);
  if (!valid) return res.status(400).json(apiResponse(false, "Missing or invalid projectId", null, errors));

  try {
    const data = await DashboardService.getSummaryStats(projectId!);
    return res.status(200).json(apiResponse(true, "Dashboard summary retrieved", data));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json(apiResponse(false, `Failed to fetch data: ${err.message}`));
  }
});

/**
 * GET /api/dashboard/trends
 */
router.get("/trends", async (req: Request, res: Response) => {
  const { valid, errors, projectId } = validateProjectId(req);
  if (!valid) return res.status(400).json(apiResponse(false, "Missing or invalid projectId", null, errors));

  let limit = Number(req.query.limit) || 10;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json(apiResponse(false, "Invalid limit", null, ["limit must be between 1 and 100"]));
  }

  try {
    const data = await DashboardService.getTrends(projectId!, limit);
    return res.status(200).json(apiResponse(true, "Trends retrieved", data));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json(apiResponse(false, `Failed to fetch data: ${err.message}`));
  }
});

/**
 * GET /api/dashboard/modules
 */
router.get("/modules", async (req: Request, res: Response) => {
  const { valid, errors, projectId } = validateProjectId(req);
  if (!valid) return res.status(400).json(apiResponse(false, "Missing or invalid projectId", null, errors));

  try {
    const data = await DashboardService.getModuleRiskAnalysis(projectId!);
    return res.status(200).json(apiResponse(true, "Module risk analysis retrieved", data));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json(apiResponse(false, `Failed to fetch data: ${err.message}`));
  }
});

/**
 * GET /api/dashboard/recent-runs
 */
router.get("/recent-runs", async (req: Request, res: Response) => {
  const { valid, errors, projectId } = validateProjectId(req);
  if (!valid) return res.status(400).json(apiResponse(false, "Missing or invalid projectId", null, errors));

  let limit = Number(req.query.limit) || 5;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return res.status(400).json(apiResponse(false, "Invalid limit", null, ["limit must be between 1 and 100"]));
  }

  try {
    const data = await DashboardService.getRecentRuns(projectId!, limit);
    // add pass_rate for frontend convenience
    const enriched = data.map((r: any) => ({
      ...r,
      pass_rate: r.total_tests > 0 ? Number(((r.passed_tests / r.total_tests) * 100).toFixed(2)) : 0,
    }));
    return res.status(200).json(apiResponse(true, "Recent runs retrieved", enriched));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json(apiResponse(false, `Failed to fetch data: ${err.message}`));
  }
});

/**
 * GET /api/dashboard/charts
 */
router.get("/charts", async (req: Request, res: Response) => {
  const { valid, errors, projectId } = validateProjectId(req);
  if (!valid) return res.status(400).json(apiResponse(false, "Missing or invalid projectId", null, errors));

  try {
    const trends = await DashboardService.getTrends(projectId!, 20); // fetch more runs for chart
    const passRateTrend = trends.map((t: any) => ({
      run_number: t.run_number,
      pass_rate: t.pass_rate,
      timestamp: t.created_at,
    }));

    const testCountTrend = trends.map((t: any) => ({
      run_number: t.run_number,
      total: t.total_tests,
      passed: t.passed_tests,
      failed: t.failed_tests,
      skipped: t.skipped_tests,
    }));

    // Example failure distribution: group by framework
    const failureDistResult = await pool.query(
      `SELECT framework, COUNT(*) AS failure_count
       FROM test_results
       WHERE status = 'FAIL' AND test_run_id IN (SELECT id FROM test_runs WHERE project_id = $1)
       GROUP BY framework`,
      [projectId]
    );

    const totalFailures = failureDistResult.rows.reduce((sum, r) => sum + Number(r.failure_count), 0);
    const failureDistribution = failureDistResult.rows.map((r: any) => ({
      framework: r.framework,
      failure_count: Number(r.failure_count),
      percentage: totalFailures > 0 ? Number(((r.failure_count / totalFailures) * 100).toFixed(2)) : 0,
    }));

    const data = {
      pass_rate_trend: passRateTrend,
      test_count_trend: testCountTrend,
      failure_distribution: failureDistribution,
    };

    return res.status(200).json(apiResponse(true, "Chart data retrieved", data));
  } catch (err: any) {
    console.error(err);
    return res.status(500).json(apiResponse(false, `Failed to fetch data: ${err.message}`));
  }
});

export default router;
