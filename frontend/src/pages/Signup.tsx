// frontend/src/pages/Signup.tsx
import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const getPasswordStrength = (pwd: string): { level: string; color: string } => {
    if (!pwd) return { level: "", color: "" };
    if (pwd.length < 6) return { level: "Weak", color: "var(--danger)" };
    if (pwd.length < 10) return { level: "Medium", color: "var(--warning)" };
    return { level: "Strong", color: "var(--success)" };
  };

  const passwordMatch = password === confirmPassword && password.length > 0;
  const strength = getPasswordStrength(password);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!name || name.length < 2) {
      setError("Please enter a valid name (min 2 characters)");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Unable to create account");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
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
          maxWidth: "480px",
          padding: "40px",
          animation: "slideIn 0.5s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ marginBottom: "8px" }}>QA Pulse</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Create your account
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
            />
          </div>

          {/* Name Input */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
              👤 Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
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
                placeholder="Min 6 characters"
                disabled={loading}
                style={{ paddingRight: "45px" }}
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

            {/* Password Strength */}
            {password && (
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    height: "4px",
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: password.length < 6 ? "33%" : password.length < 10 ? "66%" : "100%",
                      background: strength.color,
                      transition: "all 0.3s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: "12px", color: strength.color, fontWeight: "600" }}>
                  {strength.level}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
              ✓ Confirm Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                disabled={loading}
                style={{
                  paddingRight: "45px",
                  borderColor: confirmPassword && !passwordMatch ? "var(--danger)" : "var(--border-light)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: passwordMatch ? "var(--success)" : "var(--danger)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {passwordMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
              </div>
            )}
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
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            to="/login"
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
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;