import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import RiskAnalysis from "./pages/RiskAnalysis";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OrgSelector from "./components/OrgSelector";

import "./App.css";

type Page = "login" | "signup" | "dashboard" | "risk-analysis";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [projectId] = useState<number>(3);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(() => {
    const savedOrgId = localStorage.getItem("selectedOrgId");
    return savedOrgId ? Number(savedOrgId) : null;
  });

  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const currentPage: Page =
    location.pathname === "/login"
      ? "login"
      : location.pathname === "/signup"
        ? "signup"
        : location.pathname === "/risk-analysis"
          ? "risk-analysis"
          : "dashboard";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setCurrentUser(token);
    } else if (
      location.pathname !== "/login" &&
      location.pathname !== "/signup"
    ) {
      navigate("/login", { replace: true });
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedOrgId");

    setCurrentUser(null);
    setSelectedOrgId(null);

    navigate("/login", { replace: true });
  };

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "dashboard":
        navigate("/dashboard");
        break;

      case "risk-analysis":
        navigate("/risk-analysis");
        break;

      case "login":
        navigate("/login");
        break;

      case "signup":
        navigate("/signup");
        break;
    }
  };

  // Authentication pages don't show dashboard navbar
  if (currentPage === "login" || currentPage === "signup") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    );
  }

  return (
    <div
      className="app"
      style={{
        background: "#121212",
        color: "#f0f0f0",
        minHeight: "100vh",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          borderBottom: "1px solid #333",
          background: "#0a0a0a",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <h1
          style={{
            marginRight: "auto",
            marginTop: 0,
            marginBottom: 0,
            fontSize: "24px",
          }}
        >
          QA Pulse
        </h1>

        {/* Organization Selector */}
        {currentUser && (
          <OrgSelector
            onOrgChange={(orgId) => {
              setSelectedOrgId(orgId);
            }}
          />
        )}

        {/* Dashboard */}
        <button
          onClick={() => handleNavigate("dashboard")}
          style={{
            padding: "10px 20px",
            background:
              currentPage === "dashboard" ? "#0088FE" : "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight:
              currentPage === "dashboard" ? "bold" : "normal",
          }}
        >
          📊 Dashboard
        </button>

        {/* Risk Analysis */}
        <button
          onClick={() => handleNavigate("risk-analysis")}
          style={{
            padding: "10px 20px",
            background:
              currentPage === "risk-analysis" ? "#FF6B6B" : "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight:
              currentPage === "risk-analysis" ? "bold" : "normal",
          }}
        >
          ⚠️ Risk Analysis
        </button>

        {/* Logout */}
        {currentUser && (
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Logout
          </button>
        )}
      </nav>

      {/* Page Content */}
      <div className="app-content">
        <Routes>
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  projectId={projectId}
                  orgId={selectedOrgId}
                />
              </ProtectedRoute>
            }
          />

          {/* Risk Analysis */}
          <Route
            path="/risk-analysis"
            element={
              <ProtectedRoute>
                <RiskAnalysis
                  projectId={projectId}
                />
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;