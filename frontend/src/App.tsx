// frontend/src/App.tsx
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const currentPage: Page =
    location.pathname === "/login"
      ? "login"
      : location.pathname === "/signup"
        ? "signup"
        : location.pathname === "/risk-analysis"
          ? "risk-analysis"
          : "dashboard";

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    setIsMobileMenuOpen(false);

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
    setIsMobileMenuOpen(false);
  };

  // Authentication pages - no navbar
  if (currentPage === "login" || currentPage === "signup") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1a2d4d 100%)",
        color: "var(--text-primary)",
        minHeight: "100vh",
      }}
    >
      {/* ========== NAVBAR ========== */}
      <nav
        style={{
          background: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          padding: isMobile ? "15px 20px" : "0 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: isMobile ? "60px" : "70px",
          position: "relative",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <h1
          style={{
            fontSize: isMobile ? "20px" : "28px",
            margin: 0,
            cursor: "pointer",
            color: "white",
            background: "none",
            WebkitTextFillColor: "unset",
          }}
          onClick={() => navigate("/dashboard")}
        >
          QA Pulse
        </h1>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginLeft: "auto",
            }}
          >
            {/* Org Selector */}
            {currentUser && (
              <OrgSelector
                onOrgChange={(orgId) => {
                  setSelectedOrgId(orgId);
                }}
              />
            )}

            {/* Dashboard Button */}
            <button
              onClick={() => handleNavigate("dashboard")}
              style={{
                padding: "10px 20px",
                background: currentPage === "dashboard" ? "rgba(255, 255, 255, 0.2)" : "transparent",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: currentPage === "dashboard" ? "600" : "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== "dashboard") {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== "dashboard") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              📊 Dashboard
            </button>

            {/* Risk Analysis Button */}
            <button
              onClick={() => handleNavigate("risk-analysis")}
              style={{
                padding: "10px 20px",
                background: currentPage === "risk-analysis" ? "rgba(255, 255, 255, 0.2)" : "transparent",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: currentPage === "risk-analysis" ? "600" : "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== "risk-analysis") {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== "risk-analysis") {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              ⚠️ Risk Analysis
            </button>

            {/* Logout Button */}
            {currentUser && (
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 20px",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                🚪 Logout
              </button>
            )}
          </div>
        )}

        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
            }}
          >
            ☰
          </button>
        )}
      </nav>

      {/* ========== MOBILE SIDEBAR MENU ========== */}
      {isMobile && isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 99,
            }}
          />

          {/* Sidebar */}
          <div
            style={{
              position: "fixed",
              left: 0,
              top: "60px",
              width: "280px",
              background: "rgba(30, 41, 59, 0.95)",
              backdropFilter: "blur(10px)",
              zIndex: 101,
              padding: "20px",
              maxHeight: "calc(100vh - 60px)",
              overflowY: "auto",
            }}
          >
            {/* Org Selector in Mobile */}
            {currentUser && (
              <div style={{ marginBottom: "20px" }}>
                <OrgSelector
                  onOrgChange={(orgId) => {
                    setSelectedOrgId(orgId);
                  }}
                />
              </div>
            )}

            {/* Menu Items */}
            <button
              onClick={() => handleNavigate("dashboard")}
              style={{
                width: "100%",
                padding: "15px 20px",
                background: currentPage === "dashboard" ? "rgba(59, 130, 246, 0.3)" : "transparent",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "10px",
                transition: "all 0.3s ease",
              }}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => handleNavigate("risk-analysis")}
              style={{
                width: "100%",
                padding: "15px 20px",
                background: currentPage === "risk-analysis" ? "rgba(59, 130, 246, 0.3)" : "transparent",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "10px",
                transition: "all 0.3s ease",
              }}
            >
              ⚠️ Risk Analysis
            </button>

            {/* Logout Button */}
            {currentUser && (
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#FCA5A5",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginTop: "20px",
                  transition: "all 0.3s ease",
                }}
              >
                🚪 Logout
              </button>
            )}
          </div>
        </>
      )}

      {/* ========== PAGE CONTENT ========== */}
      <div style={{ minHeight: "calc(100vh - 70px)", padding: isMobile ? "20px 15px" : "30px" }}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard projectId={projectId} orgId={selectedOrgId} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/risk-analysis"
            element={
              <ProtectedRoute>
                <RiskAnalysis projectId={projectId} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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