import { Router, Request, Response } from "express";
import { RiskEngineService } from "../services/riskEngineService";
import { FlakyTestService } from "../services/flakyTestService";

const router = Router();

/**
 * GET /api/risk/flaky-tests?projectId=X
 *
 * Returns all flaky tests for a project.
 */
router.get(
  "/flaky-tests",
  async (req: Request, res: Response) => {
    try {
      const projectId = Number(req.query.projectId);

      // Validate projectId
      if (
        !req.query.projectId ||
        Number.isNaN(projectId) ||
        !Number.isInteger(projectId)
      ) {
        return res.status(400).json({
          success: false,
          message: "projectId must be a valid number",
          timestamp: new Date().toISOString(),
        });
      }

      const flakyTests =
        await FlakyTestService.detectFlakyTests(projectId);

      return res.status(200).json({
        success: true,
        data: flakyTests,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * GET /api/risk/test-scores?projectId=X
 *
 * Returns risk scores for all tests in a project.
 */
router.get(
  "/test-scores",
  async (req: Request, res: Response) => {
    try {
      const projectId = Number(req.query.projectId);

      // Validate projectId
      if (
        !req.query.projectId ||
        Number.isNaN(projectId) ||
        !Number.isInteger(projectId)
      ) {
        return res.status(400).json({
          success: false,
          message: "projectId must be a valid number",
          timestamp: new Date().toISOString(),
        });
      }

      const riskScores =
        await RiskEngineService.getAllTestRiskScores(
          projectId
        );

      return res.status(200).json({
        success: true,
        data: riskScores,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * GET /api/risk/summary?projectId=X
 *
 * Returns overall risk summary for a project.
 */
router.get(
  "/summary",
  async (req: Request, res: Response) => {
    try {
      const projectId = Number(req.query.projectId);

      // Validate projectId
      if (
        !req.query.projectId ||
        Number.isNaN(projectId) ||
        !Number.isInteger(projectId)
      ) {
        return res.status(400).json({
          success: false,
          message: "projectId must be a valid number",
          timestamp: new Date().toISOString(),
        });
      }

      const summary =
        await RiskEngineService.getRiskSummary(projectId);

      return res.status(200).json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
