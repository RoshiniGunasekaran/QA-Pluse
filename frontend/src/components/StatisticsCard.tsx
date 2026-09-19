// frontend/src/components/StatisticsCard.tsx
import React from "react";

interface StatisticsCardProps {
  label: string;
  value: number;
  percentage?: number;
  icon?: string; // emoji
  trend?: number;
  color?: "green" | "yellow" | "red" | "blue";
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  label,
  value,
  percentage,
  icon,
  trend,
  color = "blue",
}) => {
  // Background and text colors based on color prop
  const colorMap: Record<string, { bg: string; text: string }> = {
    green: { bg: "#1a472a", text: "#4ade80" },
    yellow: { bg: "#4a3a0a", text: "#fbbf24" },
    red: { bg: "#4a1a1a", text: "#f87171" },
    blue: { bg: "#1e3a5f", text: "#60a5fa" },
  };

  const { bg, text } = colorMap[color];

  // Trend indicator formatting
  let trendDisplay: React.ReactNode = null;
  if (trend !== undefined) {
    if (trend > 0) {
      trendDisplay = <span style={{ color: "#4ade80" }}>↑ {trend}%</span>;
    } else if (trend < 0) {
      trendDisplay = <span style={{ color: "#f87171" }}>↓ {Math.abs(trend)}%</span>;
    }
  }

  return (
    <div
      className="statistics-card"
      style={{
        backgroundColor: bg,
        color: text,
        minWidth: "150px",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      aria-label={`${label}: ${value}${percentage ? `, ${percentage}%` : ""}`}
    >
      {/* Header with label and optional icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontWeight: "bold", margin: 0 }}>{label}</h3>
        {icon && <span style={{ fontSize: "24px" }}>{icon}</span>}
      </div>

      {/* Value */}
      <div style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "10px 0" }}>{value}</div>

      {/* Percentage + Trend */}
      <div style={{ fontSize: "1rem" }}>
        {percentage !== undefined && <span>{percentage.toFixed(1)}%</span>}{" "}
        {trendDisplay}
      </div>
    </div>
  );
};

export default StatisticsCard;
