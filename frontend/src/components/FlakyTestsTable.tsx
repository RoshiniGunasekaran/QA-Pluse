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
      <div style={{ color: "#f0f0f0" }}>
        <p style={{ color: "#999" }}>No flaky tests detected. All tests are stable! 🎉</p>
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

  // Handle header click for sorting
  const handleSort = (key: keyof FlakyTest) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div style={{ marginTop: "20px", color: "#f0f0f0" }}>
      <h2>Flaky Tests (Tests that pass & fail)</h2>
      <div style={{ overflowX: "auto" }}>
        <table
          aria-label="Flaky Tests"
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
                onClick={() => handleSort("pass_count")}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Passes {sortKey === "pass_count" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("fail_count")}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Fails {sortKey === "fail_count" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                onClick={() => handleSort("skip_count")}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Skips {sortKey === "skip_count" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                style={{
                  padding: "15px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Stability %
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTests.map((test, idx) => {
              const stability = (test.pass_count / test.total_runs_appeared_in) * 100;
              const stabilityColor =
                stability > 70 ? "#00C49F" : stability > 40 ? "#FFBB28" : "#FF6B6B";

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: "1px solid #333",
                    background: idx % 2 === 0 ? "#1e1e1e" : "#252525",
                  }}
                >
                  <td style={{ padding: "15px", textAlign: "left" }}>
                    {test.test_name}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center", color: "#00C49F" }}>
                    {test.pass_count}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center", color: "#FF6B6B" }}>
                    {test.fail_count}
                  </td>
                  <td style={{ padding: "15px", textAlign: "center", color: "#FFBB28" }}>
                    {test.skip_count}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      textAlign: "center",
                      color: stabilityColor,
                      fontWeight: "bold",
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

export default FlakyTestsTable;