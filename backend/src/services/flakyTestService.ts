import { Pool } from "pg";

const pool = new Pool({
  user: "dev",
  password: "devpass",
  host: "localhost",
  port: 5432,
  database: "qa_pulse",
});

export class FlakyTestService {
  /**
   * Detect flaky tests for a project.
   *
   * A test is considered flaky when it has BOTH
   * PASS and FAIL results across its runs.
   */
  static async detectFlakyTests(projectId: number) {
    const query = `
      SELECT
        test_name,
        COUNT(*) FILTER (WHERE status = 'PASS') AS pass_count,
        COUNT(*) FILTER (WHERE status = 'FAIL') AS fail_count,
        COUNT(*) FILTER (WHERE status = 'SKIP') AS skip_count,
        COUNT(*) AS total_runs_appeared_in
      FROM test_results
      WHERE test_run_id IN (SELECT id FROM test_runs WHERE project_id = $1)
      GROUP BY test_name
      HAVING
        COUNT(*) FILTER (WHERE status = 'PASS') > 0
        AND
        COUNT(*) FILTER (WHERE status = 'FAIL') > 0
      ORDER BY fail_count DESC;
    `;

    const result = await pool.query(query, [projectId]);

    return result.rows;
  }

  /**
   * Check whether a specific test is flaky.
   *
   * Returns true when the test has both PASS and FAIL results
   * for the specified project.
   */
  static async isFlaky(
    test_name: string,
    projectId: number
  ): Promise<boolean> {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'PASS') AS pass_count,
        COUNT(*) FILTER (WHERE status = 'FAIL') AS fail_count
      FROM test_results
      WHERE test_name = $1
        AND project_id = $2;
    `;

    const result = await pool.query(query, [test_name, projectId]);

    const row = result.rows[0];

    return (
      Number(row.pass_count) > 0 &&
      Number(row.fail_count) > 0
    );
  }

  /**
   * Calculate how frequently a test failed.
   *
   * Formula:
   * (failCount / totalCount) * 100
   *
   * Returns a value between 0 and 100.
   */
  static calculateFlakiness(
    passCount: number,
    failCount: number,
    totalCount: number
  ): number {
    if (totalCount <= 0) {
      return 0;
    }

    const score = (failCount / totalCount) * 100;

    return Math.min(100, Math.max(0, score));
  }
}