// frontend/src/components/ModuleRiskAnalysis.tsx
import React, { useState } from "react";

interface ModuleData {
  module: string;
  total_tests: number;
  failed_tests: number;
  pass_rate: number;
  risk_score: number; // 0-100
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  recent_failures: number;
}

interface Props {
  modules: ModuleData[];
}

const ModuleRiskAnalysis: React.FC<Props> = ({ modules }) => {
  const [sortKey, setSortKey] = useState<keyof ModuleData>("risk_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!modules) return <p>Loading module analysis...</p>;
  if (modules.length === 0) return <p>No module data available</p>;

  // Sorting logic
  const sortedModules = [...modules].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  // Risk level formatting
  const riskDisplay = (level: "LOW" | "MEDIUM" | "HIGH") => {
    switch (level) {
      case "LOW":
        return <span style={{ color: "#4ade80" }}>🟢 LOW</span>;
      case "MEDIUM":
        return <span style={{ color: "#fbbf24" }}>🟡 MEDIUM</span>;
      case "HIGH":
        return <span style={{ color: "#f87171" }}>🔴 HIGH</span>;
      default:
        return level;
    }
  };

  // Handle header click for sorting
  const handleSort = (key: keyof ModuleData) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  // If only one module, show summary card
  if (modules.length === 1) {
    const m = modules[0];
    return (
      <div
        style={{
          background: "#1e3a5f",
          padding: "20px",
          borderRadius: "8px",
          color: "#f0f0f0",
          maxWidth: "400px",
        }}
      >
        <h3>{m.module}</h3>
        <p>Tests: {m.total_tests}</p>
        <p>Failed: {m.failed_tests}</p>
        <p>Pass Rate: {m.pass_rate.toFixed(1)}%</p>
        <p>Risk: {riskDisplay(m.risk_level)}</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Module Risk Analysis</h2>
      <table
        aria-label="Module Risk Analysis"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#121212",
          color: "#f0f0f0",
        }}
      >
       <thead>
  <tr style={{ background: "#1e1e1e" }}>
    <th
      onClick={() => handleSort("module")}
      aria-sort={
        sortKey === "module"
          ? sortOrder === "asc"
            ? "ascending"
            : sortOrder === "desc"
              ? "descending"
              : "none"
          : "none"
      }
      style={{ padding: "15px", cursor: "pointer", textAlign: "left" }}
    >
      Module
    </th>

    <th
      onClick={() => handleSort("total_tests")}
      aria-sort={
        sortKey === "total_tests"
          ? sortOrder === "asc"
            ? "ascending"
            : sortOrder === "desc"
              ? "descending"
              : "none"
          : "none"
      }
      style={{ padding: "15px", cursor: "pointer" }}
    >
      Tests
    </th>

    <th
      onClick={() => handleSort("failed_tests")}
      aria-sort={
        sortKey === "failed_tests"
          ? sortOrder === "asc"
            ? "ascending"
            : sortOrder === "desc"
              ? "descending"
              : "none"
          : "none"
      }
      style={{ padding: "15px", cursor: "pointer" }}
    >
      Failed
    </th>

    <th
      onClick={() => handleSort("pass_rate")}
      aria-sort={
        sortKey === "pass_rate"
          ? sortOrder === "asc"
            ? "ascending"
            : sortOrder === "desc"
              ? "descending"
              : "none"
          : "none"
      }
      style={{ padding: "15px", cursor: "pointer" }}
    >
      Pass %
    </th>

    <th
      onClick={() => handleSort("risk_score")}
      aria-sort={
        sortKey === "risk_score"
          ? sortOrder === "asc"
            ? "ascending"
            : sortOrder === "desc"
              ? "descending"
              : "none"
          : "none"
      }
      style={{ padding: "15px", cursor: "pointer" }}
    >
      Risk Level
    </th>
  </tr>
</thead>
        <tbody>
          {sortedModules.map((m, idx) => (
            <tr
              key={m.module}
              style={{
                background: idx % 2 === 0 ? "#1e1e1e" : "#2a2a2a",
                cursor: "pointer",
              }}
              title={`Recent Failures: ${m.recent_failures}, Risk Score: ${m.risk_score}`}
            >
              <td style={{ padding: "15px", fontWeight: "bold" }}>{m.module}</td>
              <td style={{ padding: "15px", textAlign: "center" }}>{m.total_tests}</td>
              <td style={{ padding: "15px", textAlign: "center" }}>{m.failed_tests}</td>
              <td style={{ padding: "15px", textAlign: "center" }}>{m.pass_rate.toFixed(1)}%</td>
              <td style={{ padding: "15px", textAlign: "center" }}>{riskDisplay(m.risk_level)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModuleRiskAnalysis;
