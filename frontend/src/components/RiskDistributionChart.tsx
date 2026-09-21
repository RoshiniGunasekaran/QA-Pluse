// frontend/src/components/RiskDistributionChart.tsx
import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface RiskSummary {
  total_tests: number;
  low_risk_tests: number;
  medium_risk_tests: number;
  high_risk_tests: number;
}

interface Props {
  summary: RiskSummary | null;
}

const RiskDistributionChart: React.FC<Props> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
        <h2 style={{ marginTop: 0 }}>🥧 Risk Distribution</h2>
        <p style={{ color: "var(--text-secondary)" }}>No data available</p>
      </div>
    );
  }

  const data = [
    { name: "LOW", value: summary.low_risk_tests, color: "#10B981" },
    { name: "MEDIUM", value: summary.medium_risk_tests, color: "#F59E0B" },
    { name: "HIGH", value: summary.high_risk_tests, color: "#EF4444" },
  ];

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

  const tooltipStyle = {
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "var(--text-primary)",
  };

  return (
    <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
      <h2 style={{ marginTop: 0 }}>🥧 Risk Distribution</h2>

      {summary.total_tests === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No tests to analyze</p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value} tests`}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default React.memo(RiskDistributionChart);