import { Pool } from "pg";

const pool = new Pool({
  user: "dev",
  password: "devpass",
  host: "localhost",
  port: 5432,
  database: "qa_pulse",
});

export class RiskEngineService {
  /**
   * Calculate risk score for a specific test.
   */
  static async calculateTestRiskScore(
    testName: string,
    projectId: number
  ) {
    // Get overall test statistics
    const statsQuery = `
      SELECT
        COUNT(*) AS total_appearances,
        COUNT(*) FILTER (WHERE status = 'PASS') AS pass_count,
        COUNT(*) FILTER (WHERE status = 'FAIL') AS fail_count
      FROM test_results
      WHERE test_name = $1
        AND test_run_id IN (SELECT id FROM test_runs WHERE project_id = $2);
    `;

    const statsResult = await pool.query(statsQuery, [
      testName,
      projectId,
    ]);

    const stats = statsResult.rows[0];

    const totalAppearances = Number(stats.total_appearances);
    const passCount = Number(stats.pass_count);
    const failCount = Number(stats.fail_count);

    // Calculate failure rate
    const failureRate =
      totalAppearances > 0
        ? (failCount / totalAppearances) * 100
        : 0;

    // Get failures from the last 3 runs
    //
    // Assumes test_results has a created_at column
    // representing when the result was recorded.
    const recentFailuresQuery = `
      SELECT COUNT(*) AS recent_failures
      FROM (
        SELECT status
        FROM test_results
        WHERE test_name = $1
          AND test_run_id IN (SELECT id FROM test_runs WHERE project_id = $2)
        ORDER BY created_at DESC
        LIMIT 3
      ) recent_runs
      WHERE status = 'FAIL';
    `;

    const recentFailuresResult = await pool.query(
      recentFailuresQuery,
      [testName, projectId]
    );

    const recentFailures = Number(
      recentFailuresResult.rows[0].recent_failures
    );

    // A test is flaky if it has both PASS and FAIL results
    const isFlaky =
      passCount > 0 &&
      failCount > 0;

    const flakinessPenalty = isFlaky ? 30 : 0;

    // Calculate risk score
    const riskScore =
      (failureRate * 0.5) +
      (recentFailures * 0.3) +
      (flakinessPenalty * 0.2);

    // Keep score between 0 and 100
    const normalizedRiskScore = Math.min(
      100,
      Math.max(0, riskScore)
    );

    return {
      test_name: testName,
      risk_score: Number(normalizedRiskScore.toFixed(2)),
      failure_rate: Number(failureRate.toFixed(2)),
      recent_failures: recentFailures,
      is_flaky: isFlaky,
    };
  }

  /**
   * Determine risk level from risk score.
   */
  static determineRiskLevel(
    riskScore: number
  ): "LOW" | "MEDIUM" | "HIGH" {
    if (riskScore <= 30) {
      return "LOW";
    }

    if (riskScore <= 60) {
      return "MEDIUM";
    }

    return "HIGH";
  }

  /**
   * Calculate risk scores for every unique test
   * in a project.
   */
  static async getAllTestRiskScores(projectId: number) {
    const testsQuery = `
      SELECT DISTINCT test_name
      FROM test_results
      WHERE test_run_id IN (SELECT id FROM test_runs WHERE project_id = $1)
      ORDER BY test_name;
    `;

    const testsResult = await pool.query(testsQuery, [projectId]);

    const riskScores = [];

    for (const row of testsResult.rows) {
      const riskData =
        await RiskEngineService.calculateTestRiskScore(
          row.test_name,
          projectId
        );

      const riskLevel =
        RiskEngineService.determineRiskLevel(
          riskData.risk_score
        );

      riskScores.push({
        test_name: riskData.test_name,
        risk_score: riskData.risk_score,
        risk_level: riskLevel,
        failure_rate: riskData.failure_rate,
        is_flaky: riskData.is_flaky,
      });
    }

    // Highest risk first
    riskScores.sort(
      (a, b) => b.risk_score - a.risk_score
    );

    return riskScores;
  }

  /**
   * Get overall risk summary for a project.
   */
  static async getRiskSummary(projectId: number) {
    const riskScores =
      await RiskEngineService.getAllTestRiskScores(
        projectId
      );

    const totalTests = riskScores.length;

    const lowRiskTests = riskScores.filter(
      (test) => test.risk_level === "LOW"
    ).length;

    const mediumRiskTests = riskScores.filter(
      (test) => test.risk_level === "MEDIUM"
    ).length;

    const highRiskTests = riskScores.filter(
      (test) => test.risk_level === "HIGH"
    ).length;

    // Because getAllTestRiskScores() is already
    // sorted descending, the first item is highest risk.
    const highestRiskTest = riskScores[0];

    // Find the test with the highest flakiness.
    // Here we count flaky tests because is_flaky is boolean.
    const flakyTests = riskScores.filter(
      (test) => test.is_flaky
    );

    const mostFlakyTest = flakyTests[0];

    return {
      total_tests: totalTests,
      low_risk_tests: lowRiskTests,
      medium_risk_tests: mediumRiskTests,
      high_risk_tests: highRiskTests,
      highest_risk_test_name:
        highestRiskTest?.test_name ?? null,
      highest_risk_score:
        highestRiskTest?.risk_score ?? 0,
      most_flaky_test_name:
        mostFlakyTest?.test_name ?? null,
      flakiness_count: flakyTests.length,
    };
  }
}