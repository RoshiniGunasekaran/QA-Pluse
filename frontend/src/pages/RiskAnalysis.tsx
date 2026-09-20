// frontend/src/pages/RiskAnalysis.tsx

import React, { useEffect, useState } from "react";

import RiskOverviewCard from "../components/Riskoverviewcard";
import FlakyTestsTable from "../components/FlakyTestsTable";
import RiskyTestsTable from "../components/RiskyTestsTable";
import RiskDistributionChart from "../components/RiskDistributionChart";

// ---------- Types ----------

interface FlakyTest {
  test_name: string;
  pass_count: number;
  fail_count: number;
  skip_count: number;
  total_runs_appeared_in: number;
}

interface RiskScore {
  test_name: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  failure_rate: number;
  is_flaky: boolean;
}

interface RiskSummary {
  total_tests: number;
  low_risk_tests: number;
  medium_risk_tests: number;
  high_risk_tests: number;
  highest_risk_test_name: string;
  highest_risk_score: number;
  most_flaky_test_name: string;
  flakiness_count: number;
}

// ---------- Main Risk Analysis Component ----------

const RiskAnalysis: React.FC<{ projectId?: number }> = ({
  projectId = 3,
}) => {
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [flakyTests, setFlakyTests] = useState<FlakyTest[]>([]);

  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);

  const [summary, setSummary] = useState<RiskSummary | null>(null);

  // ---------- Fetch Risk Analysis Data ----------

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get JWT token saved during login
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        // Headers required by the protected backend APIs
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Call all three Risk APIs
        const [flakyRes, scoresRes, summaryRes] =
          await Promise.all([
            fetch(
              `http://localhost:5000/api/risk/flaky-tests?projectId=${projectId}`,
              {
                method: "GET",
                headers,
              }
            ),

            fetch(
              `http://localhost:5000/api/risk/test-scores?projectId=${projectId}`,
              {
                method: "GET",
                headers,
              }
            ),

            fetch(
              `http://localhost:5000/api/risk/summary?projectId=${projectId}`,
              {
                method: "GET",
                headers,
              }
            ),
          ]);

        // ---------- Check API responses ----------

        if (
          !flakyRes.ok ||
          !scoresRes.ok ||
          !summaryRes.ok
        ) {
          const failedApis: string[] = [];

          if (!flakyRes.ok) {
            failedApis.push(
              `flaky-tests (${flakyRes.status})`
            );
          }

          if (!scoresRes.ok) {
            failedApis.push(
              `test-scores (${scoresRes.status})`
            );
          }

          if (!summaryRes.ok) {
            failedApis.push(
              `summary (${summaryRes.status})`
            );
          }

          throw new Error(
            `Risk API failed: ${failedApis.join(", ")}`
          );
        }

        // ---------- Convert responses to JSON ----------

        const flakyJson = await flakyRes.json();

        const scoresJson = await scoresRes.json();

        const summaryJson = await summaryRes.json();

        // ---------- Store API data ----------

        setFlakyTests(flakyJson.data);

        setRiskScores(scoresJson.data);

        setSummary(summaryJson.data);
      } catch (err: any) {
        console.error(
          "Risk Analysis error:",
          err
        );

        setError(
          err.message ||
            "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // ---------- Loading State ----------

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#f0f0f0",
        }}
      >
        <p>Loading risk analysis...</p>
      </div>
    );
  }

  // ---------- Error State ----------

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#f0f0f0",
        }}
      >
        <p
          style={{
            color: "#FF6B6B",
            marginBottom: "20px",
          }}
        >
          Error: {error}
        </p>

        <button
          onClick={() =>
            window.location.reload()
          }
          style={{
            padding: "10px 20px",
            background: "#0088FE",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ---------- No Data State ----------

  if (!summary) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#f0f0f0",
        }}
      >
        <p>No data available</p>
      </div>
    );
  }

  // ---------- Main UI ----------

  return (
    <div
      style={{
        background: "#121212",
        color: "#f0f0f0",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Header */}

      <header>
        <h1>Risk Analysis Dashboard</h1>

        <p>
          Project ID: {projectId}
        </p>
      </header>

      {/* SECTION 1: Risk Overview */}

      <section
        style={{
          marginTop: "30px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
          }}
        >
          📊 Risk Overview
        </h2>

        {/* Risk Cards */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <RiskOverviewCard
            label="Total Tests"
            value={summary.total_tests}
            icon="📋"
          />

          <RiskOverviewCard
            label="🟢 LOW Risk"
            value={summary.low_risk_tests}
            color="green"
          />

          <RiskOverviewCard
            label="🟡 MEDIUM Risk"
            value={summary.medium_risk_tests}
            color="yellow"
          />

          <RiskOverviewCard
            label="🔴 HIGH Risk"
            value={summary.high_risk_tests}
            color="red"
          />
        </div>

        {/* Highlight Statistics */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Highest Risk Test */}

          <div
            style={{
              background: "#1e1e1e",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "16px",
              }}
            >
              🏆{" "}
              <strong>
                Highest Risk Test
              </strong>
            </p>

            <p
              style={{
                margin: "10px 0 0 0",
                color: "#FF6B6B",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {summary.highest_risk_test_name}
            </p>

            <p
              style={{
                margin: "5px 0 0 0",
                color: "#999",
                fontSize: "14px",
              }}
            >
              Score:{" "}
              {summary.highest_risk_score.toFixed(
                1
              )}
            </p>
          </div>

          {/* Most Flaky Test */}

          <div
            style={{
              background: "#1e1e1e",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "16px",
              }}
            >
              ⚠️{" "}
              <strong>
                Most Flaky Test
              </strong>
            </p>

            <p
              style={{
                margin: "10px 0 0 0",
                color: "#FFBB28",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {summary.most_flaky_test_name}
            </p>

            <p
              style={{
                margin: "5px 0 0 0",
                color: "#999",
                fontSize: "14px",
              }}
            >
              Flaky Count:{" "}
              {summary.flakiness_count}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Flaky Tests */}

      <section
        style={{
          marginTop: "40px",
        }}
      >
        <FlakyTestsTable
          tests={flakyTests}
        />
      </section>

      {/* SECTION 3: Risky Tests */}

      <section
        style={{
          marginTop: "40px",
        }}
      >
        <RiskyTestsTable
          tests={riskScores}
        />
      </section>

      {/* SECTION 4: Risk Distribution */}

      <section
        style={{
          marginTop: "40px",
          marginBottom: "40px",
        }}
      >
        <RiskDistributionChart
          summary={summary}
        />
      </section>
    </div>
  );
};

export default RiskAnalysis;