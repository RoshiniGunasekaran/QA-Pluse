// frontend/src/components/ModuleRiskAnalysis.tsx
import React, { useState } from "react";

interface ModuleData {
  module: string;
  total_tests: number;
  failed_tests: number;
  pass_rate: number;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  recent_failures: number;
}

interface Props {
  modules: ModuleData[];
}

const ModuleRiskAnalysis: React.FC<Props> = ({ modules }) => {
  const [sortKey, setSortKey] = useState<keyof ModuleData>("risk_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!modules || modules.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "24px" }}>
        <h2 style={{ marginTop: 0 }}>Module Risk Analysis</h2>
        <p style={{ color: "var(--text-secondary)" }}>No module data available</p>
      </div>
    );
  }

  const riskDisplay = (level: "LOW" | "MEDIUM" | "HIGH") => {
    switch (level) {
      case "LOW":
        return "🟢 LOW";
      case "MEDIUM":
        return "🟡 MEDIUM";
      case "HIGH":
        return "🔴 HIGH";
      default:
        return level;
    }
  };

  const riskColor = (level: "LOW" | "MEDIUM" | "HIGH") => {
    switch (level) {
      case "LOW":
        return "#10B981";
      case "MEDIUM":
        return "#F59E0B";
      case "HIGH":
        return "#EF4444";
      default:
        return "#94A3B8";
    }
  };

  const sortedModules = [...modules].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const handleSort = (key: keyof ModuleData) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
      <h2 style={{ marginTop: 0 }}>Module Risk Analysis</h2>

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
                onClick={() => handleSort("module")}
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
                Module {sortKey === "module" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("total_tests")}
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
                Tests {sortKey === "total_tests" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("failed_tests")}
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
                Failed {sortKey === "failed_tests" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("pass_rate")}
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
                Pass % {sortKey === "pass_rate" && (sortOrder === "asc" ? "↑" : "↓")}
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
            </tr>
          </thead>
          <tbody>
            {sortedModules.map((m, idx) => (
              <tr
                key={m.module}
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
                <td style={{ padding: "16px", fontWeight: "600" }}>{m.module}</td>
                <td style={{ padding: "16px", textAlign: "center" }}>{m.total_tests}</td>
                <td style={{ padding: "16px", textAlign: "center", color: "#EF4444" }}>{m.failed_tests}</td>
                <td style={{ padding: "16px", textAlign: "center" }}>{m.pass_rate.toFixed(1)}%</td>
                <td
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: riskColor(m.risk_level),
                    fontWeight: "700",
                  }}
                >
                  {riskDisplay(m.risk_level)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(ModuleRiskAnalysis);