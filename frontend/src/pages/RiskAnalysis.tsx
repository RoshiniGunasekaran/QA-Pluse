// frontend/src/pages/RiskAnalysis.tsx
import React, { useEffect, useState } from "react";
import RiskOverviewCard from "../components/RiskOverviewCard";
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
const RiskAnalysis: React.FC<{ projectId?: number }> = ({ projectId = 3 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [flakyTests, setFlakyTests] = useState<FlakyTest[]>([]);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found. Please login again.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [flakyRes, scoresRes, summaryRes] = await Promise.all([
          fetch(`http://localhost:5000/api/risk/flaky-tests?projectId=${projectId}`, { method: "GET", headers }),
          fetch(`http://localhost:5000/api/risk/test-scores?projectId=${projectId}`, { method: "GET", headers }),
          fetch(`http://localhost:5000/api/risk/summary?projectId=${projectId}`, { method: "GET", headers }),
        ]);

        if (!flakyRes.ok || !scoresRes.ok || !summaryRes.ok) {
          throw new Error("Risk API failed");
        }

        const flakyJson = await flakyRes.json();
        const scoresJson = await scoresRes.json();
        const summaryJson = await summaryRes.json();

        setFlakyTests(flakyJson.data);
        setRiskScores(scoresJson.data);
        setSummary(summaryJson.data);
      } catch (err: any) {
        console.error("Risk Analysis error:", err);
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
        <div className="spinner" style={{ display: "inline-block", marginBottom: "16px" }} />
        <p>Loading risk analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: "24px" }}>
        <p style={{ color: "#EF4444", marginBottom: "16px" }}>⚠️ Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
          style={{ marginTop: "12px" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>No data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ marginBottom: "8px" }}>⚠️ Risk Analysis Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Project: {projectId}</p>
      </header>

      {/* Risk Overview Cards */}
      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "16px" }}>📊 Risk Overview</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <RiskOverviewCard label="📋 Total" value={summary.total_tests} color="blue" />
          <RiskOverviewCard label="🟢 LOW" value={summary.low_risk_tests} color="green" />
          <RiskOverviewCard label="🟡 MEDIUM" value={summary.medium_risk_tests} color="yellow" />
          <RiskOverviewCard label="🔴 HIGH" value={summary.high_risk_tests} color="red" />
        </div>

        {/* Highlight Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div className="glass-card" style={{ background: "rgba(239, 68, 68, 0.1)", padding: "20px", borderLeft: "4px solid #EF4444" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>
              🏆 Highest Risk Test
            </p>
            <p style={{ margin: "12px 0 0 0", color: "#EF4444", fontSize: "18px", fontWeight: "700" }}>
              {summary.highest_risk_test_name}
            </p>
            <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)", fontSize: "14px" }}>
              Score: {summary.highest_risk_score.toFixed(1)}
            </p>
          </div>

          <div className="glass-card" style={{ background: "rgba(245, 158, 11, 0.1)", padding: "20px", borderLeft: "4px solid #F59E0B" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>
              ⚠️ Most Flaky Test
            </p>
            <p style={{ margin: "12px 0 0 0", color: "#F59E0B", fontSize: "18px", fontWeight: "700" }}>
              {summary.most_flaky_test_name}
            </p>
            <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)", fontSize: "14px" }}>
              Flaky Count: {summary.flakiness_count}
            </p>
          </div>
        </div>
      </section>

      {/* Flaky Tests */}
      <FlakyTestsTable tests={flakyTests} />

      {/* Risky Tests */}
      <RiskyTestsTable tests={riskScores} />

      {/* Risk Distribution */}
      <RiskDistributionChart summary={summary} />
    </div>
  );
};

export default RiskAnalysis;