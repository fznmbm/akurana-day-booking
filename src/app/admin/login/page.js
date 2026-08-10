"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "../../../contexts/ConfigContext";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const config = useConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        router.push("/admin");
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#111827",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#1f2937",
          borderRadius: "12px",
          padding: "40px 32px",
          border: "1px solid #374151",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              border: "3px solid #667eea",
            }}
          >
            🔐
          </div>

          <h1
            style={{
              color: "#667eea",
              fontSize: "1.75rem",
              marginBottom: "8px",
              fontWeight: "700",
              margin: "0 0 8px 0",
            }}
          >
            Admin Login
          </h1>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            {config.organization.fullName} Event Management
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              background: "#7f1d1d",
              color: "#ef4444",
              border: "1px solid #ef444440",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                color: "#f3f4f6",
                marginBottom: "8px",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6",
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#4b5563" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#5568d3";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#667eea";
            }}
          >
            {loading ? "Logging in..." : "🔓 Login"}
          </button>
        </form>

        {/* Back Link */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <a
            href="/"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#5568d3")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#667eea")}
          >
            ← Back to RSVP Form
          </a>
        </div>
      </div>
    </div>
  );
}
