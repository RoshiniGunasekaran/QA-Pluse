// frontend/src/components/RiskOverviewCard.tsx
import React from "react";

interface RiskOverviewCardProps {
  label: string;
  value: number;
  icon?: string;
  color?: "green" | "yellow" | "red" | "blue";
}

const RiskOverviewCard: React.FC<RiskOverviewCardProps> = ({
  label,
  value,
  icon,
  color = "blue",
}) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "#10B981" },
    yellow: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B", border: "#F59E0B" },
    red: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444", border: "#EF4444" },
    blue: { bg: "rgba(59, 130, 246, 0.15)", text: "#60A5FA", border: "#3B82F6" },
  };

  const { bg, text, border } = colorMap[color];

  return (
    <div
      className="glass-card"
      style={{
        background: bg,
        borderLeft: `4px solid ${border}`,
        padding: "20px",
        minHeight: "120px",
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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>
          {label}
        </h3>
        {icon && <span style={{ fontSize: "24px" }}>{icon}</span>}
      </div>

      {/* Value */}
      <div style={{ fontSize: "36px", fontWeight: "700", color: text }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
};

export default React.memo(RiskOverviewCard);