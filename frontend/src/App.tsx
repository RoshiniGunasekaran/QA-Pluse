// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import RiskAnalysis from "./pages/RiskAnalysis";
import "./App.css";

const App: React.FC = () => {
  const [projectId, setProjectId] = useState<number>(3);
  const [currentPage, setCurrentPage] = useState<"dashboard" | "risk">("dashboard");

  useEffect(() => {
    // Optional: verify backend health
    const checkBackend = async () => {
      try {
        const response = await fetch("http://localhost:5000/health");
        if (!response.ok) {
          console.warn("Backend health check failed");
        }
      } catch (error) {
        console.error("Backend not reachable:", error);
      }
    };

    checkBackend();
    setProjectId(3); // default project for now
  }, []);

  return (
    <div className="app" style={{ background: "#121212", color: "#f0f0f0", minHeight: "100vh" }}>
      
      {/* Navigation Tabs */}
      <nav style={{ 
        display: "flex", 
        gap: "20px", 
        padding: "20px", 
        borderBottom: "1px solid #333",
        background: "#0a0a0a",
        alignItems: "center"
      }}>
        <h1 style={{ marginRight: "auto", marginTop: 0, marginBottom: 0, fontSize: "24px" }}>
          QA Pulse
        </h1>
        
        <button
          onClick={() => setCurrentPage("dashboard")}
          style={{
            padding: "10px 20px",
            background: currentPage === "dashboard" ? "#0088FE" : "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: currentPage === "dashboard" ? "bold" : "normal",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== "dashboard") {
              (e.target as HTMLButtonElement).style.background = "#444";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== "dashboard") {
              (e.target as HTMLButtonElement).style.background = "#333";
            }
          }}
        >
          📊 Dashboard
        </button>
        
        <button
          onClick={() => setCurrentPage("risk")}
          style={{
            padding: "10px 20px",
            background: currentPage === "risk" ? "#FF6B6B" : "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: currentPage === "risk" ? "bold" : "normal",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== "risk") {
              (e.target as HTMLButtonElement).style.background = "#444";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== "risk") {
              (e.target as HTMLButtonElement).style.background = "#333";
            }
          }}
        >
          ⚠️ Risk Analysis
        </button>
      </nav>

      {/* Page Content */}
      <div className="app-content">
        {currentPage === "dashboard" && <Dashboard projectId={projectId} />}
        {currentPage === "risk" && <RiskAnalysis projectId={projectId} />}
      </div>
    </div>
  );
};

export default App;