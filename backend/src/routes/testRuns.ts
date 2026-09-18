import express, { Request, Response } from "express";
import { Pool } from "pg";

const router = express.Router();

// Database connection pool (adjust config as needed)
const pool = new Pool({
  user: 'dev',
  password: 'devpass',
  host: 'localhost',
  port: 5432,
  database: 'qa_pulse',
});

/**
 * Validate incoming test run data.
 * @param data Request body
 * @returns Array of validation error messages
 */
function validateTestRun(data: any): string[] {
  const errors: string[] = [];

  const requiredFields = [
    "project_id",
    "run_number",
    "total_tests",
    "passed_tests",
    "failed_tests",
    "skipped_tests",
    "duration",
  ];

  // 1. All fields must be present
  for (const field of requiredFields) {
    if (data[field] === undefined) {
      errors.push(`Field '${field}' is required`);
    }
  }

  // 2. All numeric fields must be numbers
  for (const field of requiredFields) {
    if (data[field] !== undefined && typeof data[field] !== "number") {
      errors.push(`Field '${field}' must be a number`);
    }
  }

  // 3. project_id must be positive integer
  if (typeof data.project_id === "number" && data.project_id <= 0) {
    errors.push("Field 'project_id' must be greater than 0");
  }

  // 4. run_number must be positive integer
  if (typeof data.run_number === "number" && data.run_number <= 0) {
    errors.push("Field 'run_number' must be greater than 0");
  }

  // 5. total_tests must equal sum of passed, failed, skipped
  if (
    typeof data.total_tests === "number" &&
    typeof data.passed_tests === "number" &&
    typeof data.failed_tests === "number" &&
    typeof data.skipped_tests === "number"
  ) {
    const sum = data.passed_tests + data.failed_tests + data.skipped_tests;
    if (data.total_tests !== sum) {
      errors.push(
        `Test count mismatch: total_tests (${data.total_tests}) != passed (${data.passed_tests}) + failed (${data.failed_tests}) + skipped (${data.skipped_tests})`
      );
    }
  }

  // 6. duration must be >= 0
  if (typeof data.duration === "number" && data.duration < 0) {
    errors.push("Field 'duration' must be >= 0");
  }

  return errors;
}

/**
 * Insert a new test run into the database.
 * @param data Validated test run data
 * @returns Created record
 */
async function createTestRun(data: any) {
  const query = `
    INSERT INTO test_runs (
      project_id, run_number, total_tests,
      passed_tests, failed_tests, skipped_tests,
      duration, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *;
  `;

  const values = [
    data.project_id,
    data.run_number,
    data.total_tests,
    data.passed_tests,
    data.failed_tests,
    data.skipped_tests,
    Math.round(data.duration),
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// POST /api/test-runs
router.post("/", async (req: Request, res: Response) => {
  console.log("Incoming request body:", req.body);

  const errors = validateTestRun(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date(),
    });
  }

  try {
    const newRun = await createTestRun(req.body);
    return res.status(201).json({
      success: true,
      message: "Test run created successfully",
      data: newRun,
    });
  } catch (err: any) {
    console.error("Database error:", err.message);

    if (err.code === "23503") {
      // Foreign key violation (project_id not found)
      return res.status(400).json({
        success: false,
        message: "Project not found",
        errors: [err.message],
        timestamp: new Date(),
      });
    }

    if (err.code === "23505") {
      // Unique constraint violation (duplicate run_number)
      return res.status(400).json({
        success: false,
        message: "Duplicate run_number for project",
        errors: [err.message],
        timestamp: new Date(),
      });
    }

    return res.status(500).json({
      success: false,
      message: `Failed to create test run: ${err.message}`,
      errors: [err.message],
      timestamp: new Date(),
    });
  }
});

export default router;
