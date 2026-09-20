import { Router, Response } from "express";
import { Pool } from "pg";

import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";

import {
  sendSlackMessage,
  formatTestFailureMessage,
  formatRiskAlertMessage,
} from "../services/slackService";

const router = Router();

const pool = new Pool({
  user: "dev",
  password: "devpass",
  host: "localhost",
  port: 5432,
  database: "qa_pulse",
});

/**
 * POST /api/slack/config
 *
 * Body:
 * {
 *   "webhookUrl": "https://hooks.slack.com/services/...",
 *   "orgId": 1
 * }
 */
router.post(
  "/config",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { webhookUrl, orgId } = req.body;

      if (!webhookUrl || typeof webhookUrl !== "string") {
        return res.status(400).json({
          success: false,
          error: "webhookUrl is required",
        });
      }

      if (
        !webhookUrl.startsWith(
          "https://hooks.slack.com/services/"
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid Slack webhook URL",
        });
      }

      if (!orgId || typeof orgId !== "number") {
        return res.status(400).json({
          success: false,
          error: "orgId is required",
        });
      }

      const userId = req.user!.userId;

      // Verify that the logged-in user belongs to this organization.
      const membershipResult = await pool.query(
        `
        SELECT 1
        FROM org_members
        WHERE user_id = $1
          AND org_id = $2
        LIMIT 1
        `,
        [userId, orgId]
      );

      if (membershipResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: "You are not a member of this organization",
        });
      }

      // Create or update Slack configuration.
      await pool.query(
        `
        INSERT INTO slack_configs
          (org_id, webhook_url, enabled)
        VALUES
          ($1, $2, TRUE)
        ON CONFLICT (org_id)
        DO UPDATE SET
          webhook_url = EXCLUDED.webhook_url,
          enabled = TRUE
        `,
        [orgId, webhookUrl]
      );

      return res.json({
        success: true,
        message: "Webhook saved",
      });
    } catch (error) {
      console.error("Slack config error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to save Slack configuration",
      });
    }
  }
);

/**
 * POST /api/slack/send-alert
 *
 * Body:
 *
 * Test failure:
 * {
 *   "type": "test_failure",
 *   "data": {
 *     "testName": "...",
 *     "message": "...",
 *     "projectId": 3
 *   }
 * }
 *
 * Risk alert:
 * {
 *   "type": "risk_alert",
 *   "data": {
 *     "riskLevel": "HIGH",
 *     "commitHash": "...",
 *     "projectId": 3
 *   }
 * }
 */
router.post(
  "/send-alert",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, data } = req.body;

      if (
        type !== "test_failure" &&
        type !== "risk_alert"
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid alert type",
        });
      }

      if (!data || typeof data !== "object") {
        return res.status(400).json({
          success: false,
          error: "Alert data is required",
        });
      }

      const userId = req.user!.userId;

      /*
       * The JWT identifies the user, not a specific organization.
       * We therefore find an organization that the authenticated
       * user belongs to.
       */
      const orgResult = await pool.query(
        `
        SELECT org_id
        FROM org_members
        WHERE user_id = $1
        ORDER BY org_id
        LIMIT 1
        `,
        [userId]
      );

      if (orgResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: "User is not a member of any organization",
        });
      }

      const orgId = orgResult.rows[0].org_id;

      // Find enabled Slack configuration.
      const slackResult = await pool.query(
        `
        SELECT webhook_url
        FROM slack_configs
        WHERE org_id = $1
          AND enabled = TRUE
        LIMIT 1
        `,
        [orgId]
      );

      if (slackResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Slack not configured",
        });
      }

      const webhookUrl = slackResult.rows[0].webhook_url;

      let formattedMessage: string;

      if (type === "test_failure") {
        if (
          typeof data.testName !== "string" ||
          typeof data.message !== "string" ||
          typeof data.projectId !== "number"
        ) {
          return res.status(400).json({
            success: false,
            error:
              "test_failure requires testName, message and projectId",
          });
        }

        formattedMessage = formatTestFailureMessage(
          data.testName,
          data.message,
          data.projectId
        );
      } else {
        if (
          typeof data.riskLevel !== "string" ||
          typeof data.commitHash !== "string" ||
          typeof data.projectId !== "number"
        ) {
          return res.status(400).json({
            success: false,
            error:
              "risk_alert requires riskLevel, commitHash and projectId",
          });
        }

        formattedMessage = formatRiskAlertMessage(
          data.riskLevel,
          data.commitHash,
          data.projectId
        );
      }

      const sent = await sendSlackMessage(
        webhookUrl,
        formattedMessage
      );

      if (!sent) {
        return res.status(500).json({
          success: false,
          error: "Failed to send Slack alert",
        });
      }

      return res.json({
        success: true,
        message: "Alert sent",
      });
    } catch (error) {
      console.error("Slack alert error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to send Slack alert",
      });
    }
  }
);

export default router;