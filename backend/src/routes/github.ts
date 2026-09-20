import express, { Request, Response } from "express";
import { Pool } from "pg";
import {
  fetchCommits,
  calculateCommitRisk,
} from "../services/gitHubService";

const router = express.Router();

const pool = new Pool({
  user: "dev",
  password: "devpass",
  host: "localhost",
  port: 5432,
  database: "qa_pulse",
});

function getRiskLevel(score: number): string {
  if (score <= 30) return "LOW";
  if (score <= 60) return "MEDIUM";
  return "HIGH";
}

// GET /api/github/sync?projectId=X
router.get('/sync', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    
    console.log('🔄 Starting GitHub sync...');
    console.log('Project ID:', projectId);
    
    const commits = await fetchCommits('RoshiniGunasekaran', 'QA-Pluse');
    console.log('✅ Fetched commits:', commits.length);
    
    // Insert into DB
    for (const commit of commits) {
      console.log('Inserting commit:', commit.hash);
      await pool.query(
        `INSERT INTO commits (project_id, commit_hash, message, author, timestamp, files_changed, risk_score, risk_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (commit_hash) DO NOTHING`,
        [projectId, commit.hash, commit.message, commit.author, commit.timestamp, JSON.stringify(commit.files_changed), commit.risk_score, getRiskLevel(commit.risk_score)]
      );
    }
    
    console.log('✅ All commits inserted');
    res.json({ success: true, commits_synced: commits.length });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ GitHub sync error:', message);
    console.error('Full error:', error);
    res.json({ success: false, error: message });
  }
});


// GET /api/github/commits?projectId=X
router.get("/commits", async (req: Request, res: Response) => {
  const projectId = Number(req.query.projectId);

  if (!projectId) {
    return res.status(400).json({
      success: false,
      error: "projectId is required",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
        commit_hash,
        message,
        author,
        risk_score,
        risk_level,
        timestamp
       FROM commits
       WHERE project_id = $1
       ORDER BY timestamp DESC`,
      [projectId]
    );

    return res.json({
      success: true,
      commits: result.rows,
    });
  } catch (error) {
    console.error("Fetch commits error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch commits",
    });
  }
});

// GET /api/github/commit-risk?projectId=X
router.get("/commit-risk", async (req: Request, res: Response) => {
  const projectId = Number(req.query.projectId);

  if (!projectId) {
    return res.status(400).json({
      success: false,
      error: "projectId is required",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
        c.id,
        c.commit_hash AS hash,
        c.message,
        c.author,
        c.timestamp,
        c.files_changed,
        c.risk_score,
        c.risk_level,
        COALESCE(
          ARRAY_AGG(l.test_run_id)
          FILTER (WHERE l.test_run_id IS NOT NULL),
          '{}'
        ) AS linked_test_run_ids
       FROM commits c
       LEFT JOIN commit_test_run_link l
         ON c.id = l.commit_id
       WHERE c.project_id = $1
       AND c.risk_level IN ('HIGH', 'MEDIUM')
       GROUP BY c.id
       ORDER BY c.timestamp DESC`,
      [projectId]
    );

    return res.json({
      success: true,
      commits: result.rows,
    });
  } catch (error) {
    console.error("Commit risk error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch commit risks",
    });
  }
});

export default router;