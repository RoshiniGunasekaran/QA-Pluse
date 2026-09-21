// frontend/src/components/RiskyTestsTable.tsx
import React, { useState } from "react";

interface RiskScore {
  test_name: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  failure_rate: number;
  is_flaky: boolean;
}

interface Props {
  tests: RiskScore[];
}

const RiskyTestsTable: React.FC<Props> = ({ tests }) => {
  const [sortKey, setSortKey] = useState<keyof RiskScore>("risk_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!tests || tests.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "24px" }}>
        <h2 style={{ marginTop: 0 }}>⚠️ Top Risky Tests</h2>
        <p style={{ color: "var(--text-secondary)" }}>No tests analyzed yet.</p>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "#10B981";
      case "MEDIUM":
        return "#F59E0B";
      case "HIGH":
        return "#EF4444";
      default:
        return "var(--text-primary)";
    }
  };

  const sortedTests = [...tests].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const handleSort = (key: keyof RiskScore) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
      <h2 style={{ marginTop: 0 }}>⚠️ Top Risky Tests (Sorted by Risk Score)</h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "700px",
          }}
        >
          <thead>
            <tr style={{ background: "rgba(255, 255, 255, 0.05)", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
              <th
                onClick={() => handleSort("test_name")}
                style={{
                  padding: "16px",
                  textAlign: "left",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Test Name {sortKey === "test_name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("risk_score")}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Risk Score {sortKey === "risk_score" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("risk_level")}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Risk Level {sortKey === "risk_level" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("failure_rate")}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Failure Rate % {sortKey === "failure_rate" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                Flaky?
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTests.map((test, idx) => {
              const riskColor = getRiskColor(test.risk_level);

              return (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    borderLeft: `4px solid ${riskColor}`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent";
                  }}
                >
                  <td style={{ padding: "16px", fontWeight: "600" }}>{test.test_name}</td>
                  <td style={{ padding: "16px", textAlign: "center", color: riskColor, fontWeight: "700" }}>
                    {test.risk_score.toFixed(1)}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", color: riskColor, fontWeight: "700" }}>
                    {test.risk_level}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>{test.failure_rate.toFixed(1)}%</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        background: test.is_flaky ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: test.is_flaky ? "#EF4444" : "#10B981",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      {test.is_flaky ? "YES" : "NO"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(RiskyTestsTable);