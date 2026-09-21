// frontend/src/components/RecentRunsList.tsx
import React from "react";

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

interface RecentRunsListProps {
  runs: RecentRun[];
}

const RecentRunsList: React.FC<RecentRunsListProps> = ({ runs }) => (
  <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
    <h2 style={{ marginTop: 0 }}>📈 Recent Test Runs</h2>

    {runs.length === 0 ? (
      <p style={{ color: "var(--text-secondary)" }}>No recent runs available</p>
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {runs.map((r) => (
          <div
            key={r.id}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              padding: "16px",
              borderRadius: "8px",
              borderLeft: "4px solid var(--primary)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <p style={{ margin: "0 0 8px 0", fontWeight: "700", fontSize: "16px" }}>
              Run #{r.run_number}
            </p>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-secondary)" }}>
              📋 {r.passed_tests}/{r.total_tests} passed
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: r.pass_rate > 70 ? "#10B981" : r.pass_rate > 40 ? "#F59E0B" : "#EF4444",
              }}
            >
              {r.pass_rate.toFixed(1)}% ✓
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default RecentRunsList;