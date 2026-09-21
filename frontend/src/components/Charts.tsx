// frontend/src/components/Charts.tsx
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartsProps {
  data: {
    pass_rate_trend: { run_number: number; pass_rate: number; timestamp: string }[];
    test_count_trend: {
      run_number: number;
      total: number;
      passed: number;
      failed: number;
      skipped: number;
    }[];
    failure_distribution: { framework: string; failure_count: number; percentage: number }[];
  };
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
  if (!data) {
    return <p style={{ color: "var(--text-secondary)" }}>No chart data available</p>;
  }

  const passRateTrend = [...data.pass_rate_trend].sort((a, b) => a.run_number - b.run_number);
  const testCountTrend = [...data.test_count_trend].sort((a, b) => a.run_number - b.run_number);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const tooltipStyle = {
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "var(--text-primary)",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginTop: "24px",
      }}
    >
      {/* Pass Rate Trend Chart */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          📈 Pass Rate Trend
        </h3>

        {passRateTrend.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={passRateTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="run_number" stroke="var(--text-secondary)" />
              <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="pass_rate"
                stroke="#10B981"
                name="Pass Rate (%)"
                strokeWidth={3}
                dot={{ fill: "#10B981", r: 5 }}
                activeDot={{ r: 7 }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Test Count Trend Chart */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          📊 Test Count Trend
        </h3>

        {testCountTrend.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testCountTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="run_number" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="passed" stackId="a" fill="#10B981" name="Passed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="skipped" stackId="a" fill="#F59E0B" name="Skipped" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

            {/* Failure Distribution Chart */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          🥧 Failure Distribution
        </h3>

        {data.failure_distribution.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.failure_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ payload }: any) => `${payload.framework}: ${payload.percentage}%`}
                outerRadius={80}
                innerRadius={50}
                fill="#8884d8"
                dataKey="failure_count"
              >
                {data.failure_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default React.memo(Charts);