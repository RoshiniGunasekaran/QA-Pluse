// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ---------- Types ----------
interface Summary {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  passed_percentage: number;
  failed_percentage: number;
  skipped_percentage: number;
  release_health: number;
  release_status: "HEALTHY" | "WARNING" | "CRITICAL";
}

interface Trend {
  run_number: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  pass_rate: number;
  created_at: string;
  duration: number;
}

interface ModuleRisk {
  module: string;
  total_tests: number;
  failed_tests: number;
  pass_rate: number;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  recent_failures: number;
}

interface RecentRun {
  id: number;
  run_number: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  duration: number;
  created_at: string;
  pass_rate: number;
}

interface ChartData {
  pass_rate_trend: { run_number: number; pass_rate: number; timestamp: string }[];
  test_count_trend: { run_number: number; total: number; passed: number; failed: number; skipped: number }[];
  failure_distribution: { framework: string; failure_count: number; percentage: number }[];
}

// ---------- Child Components ----------
const StatisticsCard: React.FC<{ label: string; value: number; percentage?: number }> = ({ label, value, percentage }) => (
  <div className="card">
    <h3>{label}</h3>
    <p>{value}</p>
    {percentage !== undefined && <p>{percentage}%</p>}
  </div>
);

const ReleaseHealthCard: React.FC<{ health: number; status: string }> = ({ health, status }) => {
  const color = status === "HEALTHY" ? "green" : status === "WARNING" ? "yellow" : "red";
  return (
    <div className="card">
      <h3>Release Health</h3>
      <p style={{ color }}>{health}% ({status})</p>
    </div>
  );
};

const Charts: React.FC<{ data: ChartData | null }> = ({ data }) => {
  if (!data) return <p>No chart data available</p>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B'];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginTop: "20px" }}>
      
      {/* Line Chart: Pass Rate Trend */}
      <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
        <h3 style={{ marginTop: 0 }}>📈 Pass Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.pass_rate_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="run_number" stroke="#999" />
            <YAxis stroke="#999" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#333", border: "1px solid #666", color: "#fff" }} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="pass_rate" 
              stroke="#00C49F" 
              name="Pass Rate (%)" 
              strokeWidth={2}
              dot={{ fill: '#00C49F', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart: Test Count Trend */}
      <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
        <h3 style={{ marginTop: 0 }}>📊 Test Count Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.test_count_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="run_number" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ background: "#333", border: "1px solid #666", color: "#fff" }} />
            <Legend />
            <Bar dataKey="passed" stackId="a" fill="#00C49F" name="Passed" />
            <Bar dataKey="failed" stackId="a" fill="#FF6B6B" name="Failed" />
            <Bar dataKey="skipped" stackId="a" fill="#FFBB28" name="Skipped" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Failure Distribution */}
      <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "8px", border: "1px solid #333" }}>
        <h3 style={{ marginTop: 0 }}>🥧 Failure Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.failure_distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => `${props.payload.framework}: ${props.payload.percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="failure_count"
            >
              {data.failure_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#333", border: "1px solid #666", color: "#fff" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ModuleRiskAnalysis: React.FC<{ modules: ModuleRisk[] }> = ({ modules }) => (
  <div>
    <h3>Module Risk Analysis</h3>
    {modules.length === 0 ? <p>No modules available</p> : (
      <ul>
        {modules.map((m) => (
          <li key={m.module}>
            {m.module}: {m.risk_level} risk ({m.failed_tests} fails, {m.pass_rate}% pass rate)
          </li>
        ))}
      </ul>
    )}
  </div>
);

const RecentRunsList: React.FC<{ runs: RecentRun[] }> = ({ runs }) => (
  <div>
    <h3>Recent Runs</h3>
    {runs.length === 0 ? <p>No recent runs</p> : (
      <ul>
        {runs.map((r) => (
          <li key={r.id}>
            Run {r.run_number}: {r.pass_rate}% pass rate ({r.passed_tests}/{r.total_tests})
          </li>
        ))}
      </ul>
    )}
  </div>
);

// ---------- Main Dashboard ----------
const Dashboard: React.FC<{ projectId?: number }> = ({ projectId = 3 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [modules, setModules] = useState<ModuleRisk[]>([]);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, trendsRes, modulesRes, recentRes, chartsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/dashboard/summary?projectId=${projectId}`),
          fetch(`http://localhost:5000/api/dashboard/trends?projectId=${projectId}&limit=10`),
          fetch(`http://localhost:5000/api/dashboard/modules?projectId=${projectId}`),
          fetch(`http://localhost:5000/api/dashboard/recent-runs?projectId=${projectId}&limit=5`),
          fetch(`http://localhost:5000/api/dashboard/charts?projectId=${projectId}`),
        ]);

        if (!summaryRes.ok || !trendsRes.ok || !modulesRes.ok || !recentRes.ok || !chartsRes.ok) {
          throw new Error("One or more API calls failed");
        }

        const summaryJson = await summaryRes.json();
        const trendsJson = await trendsRes.json();
        const modulesJson = await modulesRes.json();
        const recentJson = await recentRes.json();
        const chartsJson = await chartsRes.json();

        setSummary(summaryJson.data);
        setTrends(trendsJson.data);
        setModules(modulesJson.data);
        setRecentRuns(recentJson.data);
        setChartData(chartsJson.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  if (loading) return <div className="dashboard"><p>Loading dashboard...</p></div>;
  if (error) return (
    <div className="dashboard">
      <p style={{ color: "red" }}>Error: {error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  if (!summary) return <div className="dashboard"><p>No data available</p></div>;

  return (
    <div className="dashboard" style={{ background: "#121212", color: "#f0f0f0", maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      <header>
        <h1>QA Pulse Dashboard</h1>
        <p>Project ID: {projectId}</p>
      </header>

      <section className="statistics" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <StatisticsCard label="Total Tests" value={summary.total_tests} />
        <StatisticsCard label="Passed" value={summary.passed_tests} percentage={summary.passed_percentage} />
        <StatisticsCard label="Failed" value={summary.failed_tests} percentage={summary.failed_percentage} />
        <StatisticsCard label="Skipped" value={summary.skipped_tests} percentage={summary.skipped_percentage} />
      </section>

      <section className="release-health" style={{ marginTop: "20px" }}>
        <ReleaseHealthCard health={summary.release_health} status={summary.release_status} />
      </section>

      <section className="charts" style={{ marginTop: "20px" }}>
        <Charts data={chartData} />
      </section>

      <section className="module-risk" style={{ marginTop: "20px" }}>
        <ModuleRiskAnalysis modules={modules} />
      </section>

      <section className="recent-runs" style={{ marginTop: "20px" }}>
        <RecentRunsList runs={recentRuns} />
      </section>
    </div>
  );
};

export default Dashboard;