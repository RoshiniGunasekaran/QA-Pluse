import express, { Response } from "express";
import { Pool } from "pg";

import {
  getOrganizations,
  createOrganization,
  isUserInOrg,
  getOrgMembers,
  addMemberToOrg,
} from "../services/orgService";

import {
  authMiddleware,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

const pool = new Pool({
  user: "dev",
  password: "devpass",
  host: "localhost",
  port: 5432,
  database: "qa_pulse",
});

// ============================================
// GET /api/orgs
// Get organizations for logged-in user
// ============================================

router.get(
  "/",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const organizations = await getOrganizations(userId);

      return res.json({
        success: true,
        data: organizations,
      });
    } catch (error: any) {
      console.error("Get organizations error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get organizations",
      });
    }
  }
);

// ============================================
// POST /api/orgs
// Create organization
// ============================================

router.post(
  "/",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { name } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Organization name is required",
        });
      }

      const organization = await createOrganization(
        name.trim(),
        userId
      );

      return res.status(201).json({
        success: true,
        data: organization,
      });
    } catch (error: any) {
      console.error("Create organization error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to create organization",
      });
    }
  }
);

// ============================================
// GET /api/orgs/:orgId
// Get organization details
// ============================================

router.get(
  "/:orgId",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const orgId = Number(req.params.orgId);

      if (Number.isNaN(orgId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid organization ID",
        });
      }

      const isMember = await isUserInOrg(userId, orgId);

      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      const result = await pool.query(
        `
        SELECT id, name, owner_id
        FROM organizations
        WHERE id = $1
        `,
        [orgId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Organization not found",
        });
      }

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error("Get organization error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get organization",
      });
    }
  }
);

// ============================================
// GET /api/orgs/:orgId/members
// Get organization members
// ============================================

router.get(
  "/:orgId/members",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const orgId = Number(req.params.orgId);

      if (Number.isNaN(orgId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid organization ID",
        });
      }

      const isMember = await isUserInOrg(userId, orgId);

      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      const members = await getOrgMembers(orgId);

      return res.json({
        success: true,
        data: members,
      });
    } catch (error: any) {
      console.error("Get organization members error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get organization members",
      });
    }
  }
);

// ============================================
// POST /api/orgs/:orgId/members
// Add member to organization
// ============================================

router.post(
  "/:orgId/members",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requesterId = req.user!.userId;
      const orgId = Number(req.params.orgId);

      const { email, role } = req.body;

      if (Number.isNaN(orgId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid organization ID",
        });
      }

      if (!email || typeof email !== "string") {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      const allowedRoles = ["owner", "member", "viewer"];

      if (!role || !allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role. Use owner, member, or viewer",
        });
      }

      // Check requester belongs to organization
      const requesterIsMember = await isUserInOrg(
        requesterId,
        orgId
      );

      if (!requesterIsMember) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      // Find the user being added
      const userResult = await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        `,
        [email.trim()]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "User with this email not found",
        });
      }

      const memberUserId = userResult.rows[0].id;

      // Add the TARGET user, not the requester
      await addMemberToOrg(
        memberUserId,
        orgId,
        role
      );

      return res.status(201).json({
        success: true,
        message: "Member added",
      });
    } catch (error: any) {
      console.error("Add organization member error:", error);

      // Handle duplicate membership
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          error: "User is already a member of this organization",
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to add member",
      });
    }
  }
);

export default router;