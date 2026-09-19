// backend/src/services/dashboardService.ts
import { Pool } from "pg";

// The database module is not available in this service's current source tree.
// Pool reads the connection settings from the standard PostgreSQL environment
// variables (PGHOST, PGPORT, PGDATABASE, PGUSER, and PGPASSWORD).
const pool = new Pool({
  user: 'dev',
  password: 'devpass',
  host: 'localhost',
  port: 5432,
  database: 'qa_pulse',
});

export class DashboardService {
  /**
   * Get summary statistics for a project
   */
  static async getSummaryStats(projectId: number) {
    const result = await pool.query(
      `SELECT 
         SUM(passed_tests) AS passed_tests,
         SUM(failed_tests) AS failed_tests,
         SUM(skipped_tests) AS skipped_tests,
         SUM(total_tests) AS total_tests
       FROM test_runs
       WHERE project_id = $1`,
      [projectId]
    );

    const row = result.rows[0];
    const passed = Number(row.passed_tests) || 0;
    const failed = Number(row.failed_tests) || 0;
    const skipped = Number(row.skipped_tests) || 0;
    const total = Number(row.total_tests) || 0;

    const pct = (count: number) =>
      total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;

    const releaseHealth = pct(passed);

    let status: "HEALTHY" | "WARNING" | "CRITICAL" = "CRITICAL";
    if (releaseHealth > 60) status = "HEALTHY";
    else if (releaseHealth > 30) status = "WARNING";

    return {
      total_tests: total,
      passed_tests: passed,
      failed_tests: failed,
      skipped_tests: skipped,
      passed_percentage: pct(passed),
      failed_percentage: pct(failed),
      skipped_percentage: pct(skipped),
      release_health: releaseHealth,
      release_status: status,
    };
  }

  /**
   * Get trends of recent runs
   */
  static async getTrends(projectId: number, limit: number = 10) {
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const result = await pool.query(
      `SELECT run_number, total_tests, passed_tests, failed_tests, skipped_tests, created_at, duration
       FROM test_runs
       WHERE project_id = $1
       ORDER BY run_number DESC
       LIMIT $2`,
      [projectId, limit]
    );

    const runs = result.rows.map((r: any) => ({
      run_number: r.run_number,
      total_tests: r.total_tests,
      passed_tests: r.passed_tests,
      failed_tests: r.failed_tests,
      skipped_tests: r.skipped_tests,
      pass_rate:
        r.total_tests > 0
          ? Number(((r.passed_tests / r.total_tests) * 100).toFixed(2))
          : 0,
      created_at: r.created_at,
      duration: r.duration,
    }));

    // sort ascending (oldest first)
    return runs.sort((a, b) => a.run_number - b.run_number);
  }

  /**
   * Get risk analysis per module
   */
  static async getModuleRiskAnalysis(projectId: number) {
    const result = await pool.query(
      `SELECT module,
              COUNT(*) AS total_tests,
              SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) AS failed_tests
       FROM test_results
       WHERE test_run_id IN (SELECT id FROM test_runs WHERE project_id = $1)
       GROUP BY module`,
      [projectId]
    );

    const modules = await Promise.all(
      result.rows.map(async (r: any) => {
        const total = Number(r.total_tests);
        const failed = Number(r.failed_tests);
        const passRate =
          total > 0 ? Number(((total - failed) / total * 100).toFixed(2)) : 0;

        let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
        let riskScore = (failed / total) * 100;

        if (passRate >= 95) riskLevel = "LOW";
        else if (passRate >= 80) riskLevel = "MEDIUM";
        else riskLevel = "HIGH";

        // recent failures (last 3 runs)
        const recent = await pool.query(
          `SELECT COUNT(*) AS recent_failures
           FROM test_results tr
           WHERE tr.module = $1
             AND tr.status = 'FAIL'
             AND tr.test_run_id IN (
               SELECT id FROM test_runs WHERE project_id = $2 ORDER BY run_number DESC LIMIT 3
             )`,
          [r.module, projectId]
        );

        return {
          module: r.module,
          total_tests: total,
          failed_tests: failed,
          pass_rate: passRate,
          risk_score: Number(riskScore.toFixed(2)),
          risk_level: riskLevel,
          recent_failures: Number(recent.rows[0].recent_failures),
        };
      })
    );

    return modules.sort((a, b) => b.risk_score - a.risk_score);
  }

  /**
   * Get recent runs
   */
  static async getRecentRuns(projectId: number, limit: number = 5) {
    if (limit < 1) limit = 5;
    if (limit > 100) limit = 100;

    const result = await pool.query(
      `SELECT id, run_number, total_tests, passed_tests, failed_tests, skipped_tests, created_at, duration
       FROM test_runs
       WHERE project_id = $1
       ORDER BY run_number DESC
       LIMIT $2`,
      [projectId, limit]
    );

    return result.rows;
  }
}
