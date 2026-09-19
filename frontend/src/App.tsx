// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const App: React.FC = () => {
  const [projectId, setProjectId] = useState<number>(3);

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
    <div className="app">
      <Dashboard projectId={projectId} />
    </div>
  );
};

export default App;
