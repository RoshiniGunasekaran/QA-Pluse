// frontend/src/pages/Login.tsx
import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Invalid email or password");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F172A 0%, #1a2d4d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
          animation: "slideIn 0.5s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ marginBottom: "8px" }}>QA Pulse</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email Input */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              style={{
                borderColor: error && !isValidEmail(email) ? "var(--danger)" : "var(--border-light)",
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
              🔒 Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                style={{
                  paddingRight: "45px",
                  borderColor: error && !password ? "var(--danger)" : "var(--border-light)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #EF4444",
                color: "#FCA5A5",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                display: "flex",
                gap: "8px",
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              height: "48px",
              fontSize: "16px",
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: "16px", height: "16px" }} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--primary)",
              fontWeight: "600",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--primary)";
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;