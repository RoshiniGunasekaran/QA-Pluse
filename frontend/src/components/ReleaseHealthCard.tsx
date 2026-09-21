// frontend/src/components/ReleaseHealthCard.tsx
import React from "react";

interface ReleaseHealthCardProps {
  health: number;
  status: string;
}

const ReleaseHealthCard: React.FC<ReleaseHealthCardProps> = ({ health, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "#10B981";
      case "WARNING":
        return "#F59E0B";
      case "CRITICAL":
        return "#EF4444";
      default:
        return "#94A3B8";
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px",
        background: `rgba(${
          status === "HEALTHY"
            ? "16, 185, 129"
            : status === "WARNING"
              ? "245, 158, 11"
              : "239, 68, 68"
        }, 0.1)`,
        borderLeft: `4px solid ${statusColor}`,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "16px" }}>🎯 Release Health</h3>
      <div style={{ fontSize: "36px", fontWeight: "700", color: statusColor, marginBottom: "8px" }}>
        {health.toFixed(1)}%
      </div>
      <p style={{ margin: 0, color: statusColor, fontWeight: "600" }}>{status}</p>
    </div>
  );
};

export default ReleaseHealthCard;