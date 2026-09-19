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
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChartsProps {
  data: {
    pass_rate_trend: { run_number: number; pass_rate: number; timestamp: string }[];
    test_count_trend: { run_number: number; total: number; passed: number; failed: number; skipped: number }[];
    failure_distribution: { framework: string; failure_count: number; percentage: number }[];
  };
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
  if (!data || (!data.pass_rate_trend.length && !data.test_count_trend.length && !data.failure_distribution.length)) {
    return <p>No chart data available</p>;
  }

  // Sort trends by run_number ascending
  const passRateTrend = [...data.pass_rate_trend].sort((a, b) => a.run_number - b.run_number);
  const testCountTrend = [...data.test_count_trend].sort((a, b) => a.run_number - b.run_number);

  // Colors for pie chart frameworks
  const pieColors = ["#60a5fa", "#f87171", "#4ade80", "#fbbf24", "#a78bfa", "#f472b6"];

  return (
    <div className="charts-container" style={{ color: "#f0f0f0" }}>
      <h2>Test Execution Trends</h2>

      <div
        className="charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Pass Rate Trend */}
        <div
          className="chart-card"
          style={{
            background: "#1e3a5f",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          <h3>Pass Rate Trend</h3>
          {passRateTrend.length === 0 ? (
            <p>No data for this chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={passRateTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="run_number" stroke="#f0f0f0" />
                <YAxis domain={[0, 100]} stroke="#f0f0f0" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pass_rate" stroke="#4ade80" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Test Count Trend */}
        <div
          className="chart-card"
          style={{
            background: "#1e3a5f",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          <h3>Test Count Trend</h3>
          {testCountTrend.length === 0 ? (
            <p>No data for this chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testCountTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="run_number" stroke="#f0f0f0" />
                <YAxis stroke="#f0f0f0" />
                <Tooltip />
                <Legend />
                <Bar dataKey="passed" stackId="a" fill="#4ade80" />
                <Bar dataKey="failed" stackId="a" fill="#f87171" />
                <Bar dataKey="skipped" stackId="a" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Failure Distribution */}
        <div
          className="chart-card"
          style={{
            background: "#1e3a5f",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          <h3>Failure Distribution</h3>
          {data.failure_distribution.length === 0 ? (
            <p>No data for this chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={data.failure_distribution}
                  dataKey="failure_count"
                  nameKey="framework"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  label
                >
                  {data.failure_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Charts);
