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
  if (!summary) return null;

  const data = [
    { name: "LOW", value: summary.low_risk_tests, color: "#00C49F" },
    { name: "MEDIUM", value: summary.medium_risk_tests, color: "#FFBB28" },
    { name: "HIGH", value: summary.high_risk_tests, color: "#FF6B6B" },
  ];

  const COLORS = ["#00C49F", "#FFBB28", "#FF6B6B"];

  return (
    <div
      style={{
        marginTop: "20px",
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #333",
        color: "#f0f0f0",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Risk Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#333", border: "1px solid #666", color: "#fff" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistributionChart;