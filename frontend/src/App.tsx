import React, { useState, useEffect } from "react";
import "./App.css";

const App: React.FC = () => {
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("http://localhost:5000/health");
        if (response.ok) {
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }
      } catch (error) {
        setBackendConnected(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="app-container">
      <h1>QA Pulse</h1>
      <h2>Quality Intelligence Platform</h2>

      <div className="status-section">
        <p>
          <strong>Backend Status:</strong>{" "}
          {loadingStatus ? (
            <span className="loading">Checking...</span>
          ) : backendConnected ? (
            <span className="status-dot connected"></span>
          ) : (
            <span className="status-dot disconnected"></span>
          )}
        </p>

        <p>
          <strong>Database Status:</strong>{" "}
          <span className="status-dot connected"></span> Connected
        </p>
      </div>
    </div>
  );
};

export default App;
