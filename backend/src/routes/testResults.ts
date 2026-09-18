import express, { Request, Response } from "express";
import { Pool } from "pg";
import { TestStatus } from "../types/testResults";

const router = express.Router();

// Database connection pool
const pool = new Pool({
  user: 'dev',
  password: 'devpass',
  host: 'localhost',
  port: 5432,
  database: 'qa_pulse',
});


/**
 * Validate a single test result.
 * @param result Test result object
 * @param index Index in array
 * @returns Array of error messages
 */
function validateSingleResult(result: any, index: number): string[] {
  const errors: string[] = [];

  if (!result.test_name || typeof result.test_name !== "string" || !result.test_name.trim()) {
    errors.push(`Test result ${index}: test_name is required and cannot be empty`);
  }

  if (!result.status || typeof result.status !== "string") {
    errors.push(`Test result ${index}: status must be PASS, FAIL, or SKIPPED`);
  } else {
    const status = result.status.toUpperCase();
    if (![TestStatus.PASS, TestStatus.FAIL, TestStatus.SKIPPED].includes(status as TestStatus)) {
      errors.push(`Test result ${index}: status must be PASS, FAIL, or SKIPPED`);
    }
  }

  if (typeof result.duration !== "number") {
    errors.push(`Test result ${index}: duration must be a number`);
  } else if (result.duration < 0) {
    errors.push(`Test result ${index}: duration cannot be negative`);
  }

  if (!result.module || typeof result.module !== "string" || !result.module.trim()) {
    errors.push(`Test result ${index}: module is required`);
  }

  if (!result.framework || typeof result.framework !== "string" || !result.framework.trim()) {
    errors.push(`Test result ${index}: framework is required`);
  }

  return errors;
}

/**
 * Validate incoming request body for test results.
 * @param data Request body
 * @returns Array of validation error messages
 */
async function validateTestResults(data: any): Promise<string[]> {
  const errors: string[] = [];

  if (data.test_run_id === undefined) {
    errors.push("test_run_id is required");
  } else if (typeof data.test_run_id !== "number" || data.test_run_id <= 0) {
    errors.push("test_run_id must be a positive integer");
  } else {
    // Check if test_run_id exists
    const runCheck = await pool.query("SELECT id FROM test_runs WHERE id = $1", [data.test_run_id]);
    if (runCheck.rowCount === 0) {
      errors.push(`Test run with ID ${data.test_run_id} not found`);
    }
  }

  if (!Array.isArray(data.results)) {
    errors.push("Results must be an array");
  } else if (data.results.length === 0) {
    errors.push("Results array must contain at least 1 test result");
  } else {
    data.results.forEach((r: any, i: number) => {
      errors.push(...validateSingleResult(r, i));
    });
  }

  return errors;
}

/**
 * Insert test results into database using transaction.
 * @param test_run_id ID of test run
 * @param results Array of test results
 * @returns Inserted records
 */
async function insertTestResults(test_run_id: number, results: any[]) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inserted: any[] = [];
    for (const r of results) {
      const status = r.status.toUpperCase();
      const query = `
        INSERT INTO test_results (
          test_run_id, test_name, status, duration, module, framework, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
      `;
      const values = [
        test_run_id,
        r.test_name.trim(),
        status,
        Math.round(r.duration),
        r.module.trim(),
        r.framework.trim(),
      ];
      const res = await client.query(query, values);
      inserted.push(res.rows[0]);
    }

    await client.query("COMMIT");
    return inserted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// POST /api/test-results
router.post("/", async (req: Request, res: Response) => {
  console.log("Incoming test results request:", req.body);

  try {
    const errors = await validateTestResults(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
        timestamp: new Date(),
      });
    }

    const inserted = await insertTestResults(req.body.test_run_id, req.body.results);

    return res.status(201).json({
      success: true,
      message: `${inserted.length} test results created successfully`,
      data: {
        inserted_count: inserted.length,
        test_run_id: req.body.test_run_id,
        results: inserted,
      },
    });
  } catch (err: any) {
    console.error("Database error:", err.message);
    return res.status(500).json({
      success: false,
      message: `Failed to insert test results: ${err.message}`,
      errors: [err.message],
      timestamp: new Date(),
    });
  }
});

export default router;
