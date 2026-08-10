"use client";

import { useState, useEffect } from "react";
import { useConfig } from "../../../contexts/ConfigContext";

export default function CheckInDisplay() {
  const config = useConfig();
  const [stats, setStats] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/rsvps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        const checkedInList = data.data
          .filter((r) => r.checkedIn)
          .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
          .slice(0, 15);

        setRecentCheckIns(checkedInList);

        const checkedInCount = data.data.filter((r) => r.checkedIn).length;
        const paidCount = data.data.filter(
          (r) => r.paymentStatus === "paid",
        ).length;

        const percentage =
          paidCount > 0 ? Math.round((checkedInCount / paidCount) * 100) : 0;

        // Check for milestone celebrations
        const currentMilestone = Math.floor(percentage / 25) * 25;
        if (currentMilestone > lastMilestone && currentMilestone > 0) {
          setShowCelebration(true);
          setLastMilestone(currentMilestone);
          setTimeout(() => setShowCelebration(false), 3000);
        }

        setStats({
          checkedIn: checkedInCount,
          total: paidCount,
          percentage,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (!stats) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0e1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: "2rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 100%)",
        padding: "40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Celebration Overlay */}
      {showCelebration && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(16, 185, 129, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "celebration 3s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "30px",
            }}
          >
            {/* Animated Checkmark Badge */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "4px solid #10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                color: "#10b981",
                animation: "pulse 2s ease-in-out infinite",
                boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)",
              }}
            >
              ✓
            </div>

            {/* Percentage */}
            <div
              style={{
                fontSize: "8rem",
                fontWeight: "900",
                color: "#10b981",
                textShadow: "0 0 40px rgba(16, 185, 129, 0.8)",
                lineHeight: "1",
              }}
            >
              {lastMilestone}%
            </div>

            {/* Status Label */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#6ee7b7",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                }}
              >
                {lastMilestone === 100 ? "COMPLETE" : "MILESTONE"}
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                {lastMilestone === 100 ? "All Checked In" : "Reached"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
        }}
      >
        {/* Left: Custom Layout */}
        <div style={{ flex: 1 }}>
          {/* Top Row: Logo + Subtitle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            {/* Logo */}
            <img
              src="/logo.png"
              alt="AHHC Logo"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              }}
            />

            {/* Subtitle Box */}
            <div>
              <p
                style={{
                  fontSize: "1.5rem",
                  color: "#e0e7ff",
                  fontWeight: "600",
                  margin: 0,
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                {config.event.fullName}
              </p>
            </div>
          </div>

          {/* Bottom Row: Title */}
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "900",
              color: "#f9fafb",
              margin: 0,
              letterSpacing: "-1px",
            }}
          >
            🎫 LIVE EVENT CHECK-IN
          </h1>
        </div>

        {/* Right: Time/Date - Keep as is */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              color: "#667eea",
              lineHeight: "1",
            }}
          >
            {currentTime.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div
            style={{
              fontSize: "1.25rem",
              color: "#9ca3af",
              marginTop: "4px",
            }}
          >
            {currentTime.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px" }}
      >
        {/* Left Column - Progress */}
        <div>
          {/* Main Progress Circle */}
          <div
            style={{
              background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
              borderRadius: "24px",
              padding: "60px",
              border: "2px solid #4b5563",
              marginBottom: "30px",
              position: "relative",
            }}
          >
            {/* Circular Progress */}
            <div
              style={{
                width: "400px",
                height: "400px",
                margin: "0 auto",
                position: "relative",
              }}
            >
              {/* Background Circle */}
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: "rotate(-90deg)",
                }}
                width="400"
                height="400"
              >
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  stroke="#374151"
                  strokeWidth="30"
                  fill="none"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  stroke="url(#gradient)"
                  strokeWidth="30"
                  fill="none"
                  strokeDasharray={`${
                    (stats.percentage / 100) * 1130.97
                  } 1130.97`}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dasharray 1s ease-out",
                  }}
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#667eea" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Text */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "7rem",
                    fontWeight: "900",
                    color: "#10b981",
                    lineHeight: "1",
                    marginBottom: "16px",
                  }}
                >
                  {stats.percentage}%
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    color: "#f9fafb",
                    marginBottom: "8px",
                  }}
                >
                  {stats.checkedIn} / {stats.total}
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  Checked In
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            style={{
              background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
              border: "2px solid #10b981",
              boxShadow: "0 0 40px rgba(16, 185, 129, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                color: "#10b981",
                fontWeight: "700",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  background: "#10b981",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}
              />
              LIVE CHECK-IN ACTIVE
            </div>
            <div style={{ fontSize: "1rem", color: "#6ee7b7" }}>
              Updates every 5 seconds
            </div>
          </div>
        </div>

        {/* Right Column - Live Feed */}
        <div>
          <div
            style={{
              background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
              borderRadius: "24px",
              padding: "40px",
              border: "2px solid #4b5563",
              height: "calc(100vh - 280px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
                paddingBottom: "24px",
                borderBottom: "2px solid #4b5563",
              }}
            >
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#f9fafb",
                  margin: 0,
                }}
              >
                ✅ Recent Check-Ins
              </h2>
              <div
                style={{
                  background: "#10b981",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {recentCheckIns.length} Latest
              </div>
            </div>

            {/* Scrolling Feed */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: "12px",
              }}
            >
              {recentCheckIns.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "1.5rem",
                    marginTop: "60px",
                  }}
                >
                  Waiting for first check-in...
                </div>
              ) : (
                recentCheckIns.map((person, index) => {
                  const timeAgo = Math.floor(
                    (Date.now() - new Date(person.checkInTime)) / 1000,
                  );
                  const timeText =
                    timeAgo < 60
                      ? "Just now"
                      : timeAgo < 3600
                        ? `${Math.floor(timeAgo / 60)}m ago`
                        : new Date(person.checkInTime).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          );

                  return (
                    <div
                      key={person._id}
                      style={{
                        background:
                          index === 0
                            ? "linear-gradient(135deg, #064e3b 0%, #047857 100%)"
                            : "#111827",
                        borderRadius: "16px",
                        padding: "24px",
                        marginBottom: "16px",
                        border: `2px solid ${
                          index === 0 ? "#10b981" : "#374151"
                        }`,
                        animation:
                          index === 0 ? "slideInRight 0.5s ease-out" : "none",
                        boxShadow:
                          index === 0
                            ? "0 8px 32px rgba(16, 185, 129, 0.4)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "20px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "1.75rem",
                              fontWeight: "700",
                              color: "#f9fafb",
                              marginBottom: "8px",
                            }}
                          >
                            {person.name}
                          </div>
                          <div
                            style={{
                              fontSize: "1.25rem",
                              color: "#9ca3af",
                              marginBottom: "8px",
                            }}
                          >
                            👥{" "}
                            {person.under5 + person.age5to12 + person.age12plus}{" "}
                            people
                          </div>
                          <div
                            style={{
                              fontSize: "1rem",
                              color: "#6b7280",
                            }}
                          >
                            🕐 {timeText}
                            {person.checkInBy && ` • by ${person.checkInBy}`}
                          </div>
                        </div>

                        {index === 0 && (
                          <div
                            style={{
                              background: "#10b981",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              fontWeight: "700",
                              color: "white",
                              whiteSpace: "nowrap",
                              animation: "pulse 2s infinite",
                            }}
                          >
                            NEW
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "40px",
          fontSize: "1rem",
          color: "#6b7280",
        }}
      >
        Powered by elitestack.co.uk
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes celebration {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
