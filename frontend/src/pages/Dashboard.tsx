// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import StatisticsCard from "../components/StatisticsCard";
import Charts from "../components/Charts";
import ModuleRiskAnalysis from "../components/ModuleRiskAnalysis";

// ---------- Types ----------
interface Summary {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  passed_percentage: number;
  failed_percentage: number;
  skipped_percentage: number;
  release_health: number;
  release_status: "HEALTHY" | "WARNING" | "CRITICAL";
}

interface Trend {
  run_number: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  pass_rate: number;
  created_at: string;
  duration: number;
}

interface ModuleRisk {
  module: string;
  total_tests: number;
  failed_tests: number;
  pass_rate: number;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  recent_failures: number;
}

interface RecentRun {
  id: number;
  run_number: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  duration: number;
  created_at: string;
  pass_rate: number;
}

interface ChartData {
  pass_rate_trend: {
    run_number: number;
    pass_rate: number;
    timestamp: string;
  }[];

  test_count_trend: {
    run_number: number;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  }[];

  failure_distribution: {
    framework: string;
    failure_count: number;
    percentage: number;
  }[];
}

// ---------- Components ----------

const ReleaseHealthCard: React.FC<{
  health: number;
  status: string;
}> = ({ health, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "#10B981";

      case "WARNING":
        return "#F59E0B";

      case "CRITICAL":
        return "#EF4444";

      default:
        return "#94A3B8";
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px",
        background: `rgba(${
          status === "HEALTHY"
            ? "16, 185, 129"
            : status === "WARNING"
            ? "245, 158, 11"
            : "239, 68, 68"
        }, 0.1)`,
        borderLeft: `4px solid ${statusColor}`,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "16px",
        }}
      >
        🎯 Release Health
      </h3>

      <div
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: statusColor,
          marginBottom: "8px",
        }}
      >
        {health.toFixed(1)}%
      </div>

      <p
        style={{
          margin: 0,
          color: statusColor,
          fontWeight: "600",
        }}
      >
        {status}
      </p>
    </div>
  );
};

const RecentRunsList: React.FC<{
  runs: RecentRun[];
}> = ({ runs }) => (
  <div
    className="glass-card"
    style={{
      padding: "24px",
      marginTop: "24px",
    }}
  >
    <h2 style={{ marginTop: 0 }}>
      Recent Test Runs
    </h2>

    {runs.length === 0 ? (
      <p
        style={{
          color: "var(--text-secondary)",
        }}
      >
        No recent runs available
      </p>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        {runs.map((r) => (
          <div
            key={r.id}
            style={{
              background:
                "rgba(255, 255, 255, 0.05)",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                fontWeight: "600",
              }}
            >
              Run #{r.run_number}
            </p>

            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                color: "var(--text-secondary)",
              }}
            >
              📋 {r.passed_tests}/{r.total_tests} passed
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color:
                  r.pass_rate > 70
                    ? "#10B981"
                    : r.pass_rate > 40
                    ? "#F59E0B"
                    : "#EF4444",
              }}
            >
              {r.pass_rate.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ---------- Main Dashboard ----------

interface DashboardProps {
  projectId?: number;
  orgId?: number | null;
}

const Dashboard: React.FC<DashboardProps> = ({
  projectId = 3,
  orgId = null,
}) => {
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [modules, setModules] =
    useState<ModuleRisk[]>([]);

  const [recentRuns, setRecentRuns] =
    useState<RecentRun[]>([]);

  const [chartData, setChartData] =
    useState<ChartData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (orgId === null) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          summaryRes,
          modulesRes,
          recentRes,
          chartsRes,
        ] = await Promise.all([
          fetch(
            `http://localhost:5000/api/dashboard/summary?projectId=${projectId}`,
            { headers }
          ),

          fetch(
            `http://localhost:5000/api/dashboard/modules?projectId=${projectId}`,
            { headers }
          ),

          fetch(
            `http://localhost:5000/api/dashboard/recent-runs?projectId=${projectId}&limit=5`,
            { headers }
          ),

          fetch(
            `http://localhost:5000/api/dashboard/charts?projectId=${projectId}`,
            { headers }
          ),
        ]);

        if (
          summaryRes.status === 401 ||
          modulesRes.status === 401 ||
          recentRes.status === 401 ||
          chartsRes.status === 401
        ) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (
          !summaryRes.ok ||
          !modulesRes.ok ||
          !recentRes.ok ||
          !chartsRes.ok
        ) {
          throw new Error(
            "One or more API calls failed"
          );
        }

        const summaryJson =
          await summaryRes.json();

        const modulesJson =
          await modulesRes.json();

        const recentJson =
          await recentRes.json();

        const chartsJson =
          await chartsRes.json();

        setSummary(summaryJson.data);
        setModules(modulesJson.data);
        setRecentRuns(recentJson.data);
        setChartData(chartsJson.data);
      } catch (err: any) {
        console.error(err);

        setError(
          err.message ||
            "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, orgId]);

  // ---------- Loading ----------
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "var(--text-secondary)",
        }}
      >
        <div
          className="spinner"
          style={{
            display: "inline-block",
            marginBottom: "16px",
          }}
        />

        <p>Loading dashboard...</p>
      </div>
    );
  }

  // ---------- Organization not selected ----------
  if (orgId === null) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Please select an organization to
          view the dashboard.
        </p>
      </div>
    );
  }

  // ---------- Error ----------
  if (error) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "24px",
        }}
      >
        <p
          style={{
            color: "#EF4444",
            marginBottom: "16px",
          }}
        >
          ⚠️ Error: {error}
        </p>

        <button
          onClick={() =>
            window.location.reload()
          }
          className="btn-primary"
          style={{
            marginTop: "12px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ---------- No summary ----------
  if (!summary) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          No data available
        </p>
      </div>
    );
  }

  // ---------- Dashboard ----------
  return (
    <div>
      {/* Header */}
      <header
        style={{
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
          }}
        >
          📊 QA Pulse Dashboard
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          Org: {orgId} • Project: {projectId}
        </p>
      </header>

      {/* Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <StatisticsCard
          label="Total Tests"
          value={summary.total_tests}
          icon="📋"
          color="blue"
        />

        <StatisticsCard
          label="✅ Passed"
          value={summary.passed_tests}
          percentage={
            summary.passed_percentage
          }
          icon="✓"
          color="green"
        />

        <StatisticsCard
          label="❌ Failed"
          value={summary.failed_tests}
          percentage={
            summary.failed_percentage
          }
          icon="✗"
          color="red"
        />

        <StatisticsCard
          label="⏭️ Skipped"
          value={summary.skipped_tests}
          percentage={
            summary.skipped_percentage
          }
          icon="→"
          color="yellow"
        />
      </div>

      {/* Release Health */}
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <ReleaseHealthCard
          health={summary.release_health}
          status={summary.release_status}
        />
      </div>

      {/* Charts */}
      {chartData ? (
        <Charts data={chartData} />
      ) : (
        <div
          className="glass-card"
          style={{
            padding: "24px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            No chart data available
          </p>
        </div>
      )}

      {/* Module Risk Analysis */}
      <ModuleRiskAnalysis
        modules={modules}
      />

      {/* Recent Runs */}
      <RecentRunsList
        runs={recentRuns}
      />
    </div>
  );
};

export default Dashboard;