// frontend/src/components/FlakyTestsTable.tsx
import React, { useState } from "react";

interface FlakyTest {
  test_name: string;
  pass_count: number;
  fail_count: number;
  skip_count: number;
  total_runs_appeared_in: number;
}

interface Props {
  tests: FlakyTest[];
}

const FlakyTestsTable: React.FC<Props> = ({ tests }) => {
  const [sortKey, setSortKey] = useState<keyof FlakyTest>("fail_count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!tests || tests.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "24px" }}>
        <h2 style={{ marginTop: 0 }}>🔄 Flaky Tests</h2>
        <p style={{ color: "#10B981", fontSize: "16px", fontWeight: "600" }}>
          ✓ No flaky tests detected. All tests are stable! 🎉
        </p>
      </div>
    );
  }

  const sortedTests = [...tests].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const handleSort = (key: keyof FlakyTest) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
      <h2 style={{ marginTop: 0 }}>🔄 Flaky Tests (Tests that pass & fail)</h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px",
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
                onClick={() => handleSort("pass_count")}
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
                Passes {sortKey === "pass_count" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("fail_count")}
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
                Fails {sortKey === "fail_count" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("skip_count")}
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
                Skips {sortKey === "skip_count" && (sortOrder === "asc" ? "↑" : "↓")}
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
                Stability %
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTests.map((test, idx) => {
              const stability = (test.pass_count / test.total_runs_appeared_in) * 100;
              const stabilityColor = stability > 70 ? "#10B981" : stability > 40 ? "#F59E0B" : "#EF4444";

              return (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
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
                  <td style={{ padding: "16px", textAlign: "center", color: "#10B981" }}>{test.pass_count}</td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#EF4444" }}>{test.fail_count}</td>
                  <td style={{ padding: "16px", textAlign: "center", color: "#F59E0B" }}>{test.skip_count}</td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: stabilityColor,
                      fontWeight: "700",
                    }}
                  >
                    {stability.toFixed(1)}%
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

export default React.memo(FlakyTestsTable);