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
      <div style={{ color: "#f0f0f0" }}>
        <p style={{ color: "#999" }}>No tests analyzed yet.</p>
      </div>
    );
  }

  // Sorting logic
  const sortedTests = [...tests].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  // Get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "#00C49F";
      case "MEDIUM":
        return "#FFBB28";
      case "HIGH":
        return "#FF6B6B";
      default:
        return "#f0f0f0";
    }
  };

  // Handle header click for sorting
  const handleSort = (key: keyof RiskScore) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div style={{ marginTop: "20px", color: "#f0f0f0" }}>
      <h2>Top Risky Tests (Sorted by Risk Score)</h2>
      <div style={{ overflowX: "auto" }}>
        <table
          aria-label="Risky Tests"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#1e1e1e",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "#0a0a0a", borderBottom: "2px solid #333" }}>
              <th
                onClick={() => handleSort("test_name")}
                style={{
                  padding: "15px",
                  textAlign: "left",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Test Name {sortKey === "test_name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("risk_score")}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Risk Score {sortKey === "risk_score" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("risk_level")}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Risk Level {sortKey === "risk_level" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("failure_rate")}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Failure Rate % {sortKey === "failure_rate" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
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
                    borderBottom: "1px solid #333",
                    background: idx % 2 === 0 ? "#1e1e1e" : "#252525",
                    borderLeft: `4px solid ${riskColor}`,
                  }}
                >
                  <td style={{ padding: "15px", textAlign: "left" }}>
                    {test.test_name}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: riskColor,
                    }}
                  >
                    {test.risk_score.toFixed(1)}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      textAlign: "center",
                      color: riskColor,
                      fontWeight: "bold",
                    }}
                  >
                    {test.risk_level}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    {test.failure_rate.toFixed(1)}%
                  </td>
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background: test.is_flaky ? "#FF6B6B" : "#00C49F",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "bold",
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

export default RiskyTestsTable;