// frontend/src/components/StatisticsCard.tsx
import React from "react";

interface StatisticsCardProps {
  label: string;
  value: number;
  percentage?: number;
  icon?: string;
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
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981", border: "#10B981" },
    yellow: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B", border: "#F59E0B" },
    red: { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444", border: "#EF4444" },
    blue: { bg: "rgba(59, 130, 246, 0.1)", text: "#60A5FA", border: "#3B82F6" },
  };

  const { bg, text, border } = colorMap[color];

  let trendDisplay: React.ReactNode = null;
  if (trend !== undefined) {
    if (trend > 0) {
      trendDisplay = <span style={{ color: "#10B981", fontSize: "12px", fontWeight: "600" }}>↑ {trend}%</span>;
    } else if (trend < 0) {
      trendDisplay = <span style={{ color: "#EF4444", fontSize: "12px", fontWeight: "600" }}>↓ {Math.abs(trend)}%</span>;
    }
  }

  return (
    <div
      className="glass-card"
      style={{
        background: bg,
        borderLeft: `4px solid ${border}`,
        padding: "24px",
        minHeight: "140px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 20px 25px rgba(0, 0, 0, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
    >
      {/* Header with label and icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>
          {label}
        </h3>
        {icon && <span style={{ fontSize: "24px" }}>{icon}</span>}
      </div>

      {/* Value */}
      <div style={{ fontSize: "32px", fontWeight: "700", color: text, marginBottom: "8px" }}>
        {value.toLocaleString()}
      </div>

      {/* Percentage + Trend */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {percentage !== undefined && (
          <span style={{ fontSize: "14px", color: text, fontWeight: "600" }}>
            {percentage.toFixed(1)}%
          </span>
        )}
        {trendDisplay}
      </div>
    </div>
  );
};

export default React.memo(StatisticsCard);