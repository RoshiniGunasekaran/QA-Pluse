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
  const colorMap: Record<string, { bg: string; text: string }> = {
    green: { bg: "#1a472a", text: "#00C49F" },
    yellow: { bg: "#4a3a0a", text: "#FFBB28" },
    red: { bg: "#4a1a1a", text: "#FF6B6B" },
    blue: { bg: "#1e3a5f", text: "#60a5fa" },
  };

  const { bg, text } = colorMap[color];

  return (
    <div
      className="risk-overview-card"
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
        flex: 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontWeight: "bold", margin: 0, fontSize: "14px" }}>{label}</h3>
        {icon && <span style={{ fontSize: "24px" }}>{icon}</span>}
      </div>

      <div style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "10px 0" }}>
        {value}
      </div>
    </div>
  );
};

export default RiskOverviewCard;