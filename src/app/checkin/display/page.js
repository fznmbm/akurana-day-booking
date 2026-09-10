"use client";

import { useState, useEffect, useRef } from "react";
import { useConfig } from "../../../contexts/ConfigContext";

export default function CheckInDisplay() {
  const config = useConfig();
  const [stats, setStats] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);
  const [authError, setAuthError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const latestSeenIdRef = useRef(null);
  const [justArrived, setJustArrived] = useState(null);
  const tickerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

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

  // Continuous auto-scroll of the ticker — entirely decoupled from data
  // fetching and from the spotlight panel. Runs once, forever, quietly
  // looping through whatever the ticker currently contains.
  useEffect(() => {
    let rafId;
    let paused = false;

    const step = () => {
      const el = tickerRef.current;
      if (el && !paused) {
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        if (atBottom && el.scrollHeight > el.clientHeight) {
          paused = true;
          setTimeout(() => {
            if (tickerRef.current) tickerRef.current.scrollTop = 0;
            paused = false;
          }, 3000);
        } else {
          el.scrollTop += 0.4;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Keep the ticker's visual scroll position stable when a new check-in is
  // prepended to the top — without this, new content pushing in from
  // above would visually shove whatever's currently on screen downward.
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    const newHeight = el.scrollHeight;
    const diff = newHeight - prevScrollHeightRef.current;
    if (diff > 0 && prevScrollHeightRef.current > 0) {
      el.scrollTop += diff;
    }
    prevScrollHeightRef.current = newHeight;
  }, [recentCheckIns]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
           const response = await fetch("/api/admin/rsvps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        setAuthError(true);
        return;
      }

      if (response.ok) {
        setAuthError(false);
        const checkedInList = data.data
          .filter((r) => r.checkedIn)
          .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
          //.slice(0, 30);

        const topPerson = checkedInList[0] || null;
        if (topPerson && topPerson._id !== latestSeenIdRef.current) {
          // Persistent, not timed — stays accurate until someone genuinely
          // newer replaces them.
          setJustArrived(topPerson);
          latestSeenIdRef.current = topPerson._id;
        }

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
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Deliberately don't touch lastUpdated here — a failed poll should
      // make the on-screen "Last updated" time fall behind, which is
      // exactly the visible signal that something's wrong.
    }
  };

  if (authError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0e1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
          <h2
            style={{
              color: "#f9fafb",
              fontSize: "1.5rem",
              marginBottom: "12px",
            }}
          >
            Not Logged In
          </h2>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "1rem",
              maxWidth: "400px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            This display needs an active admin login on this device. Open{" "}
            <a href="/admin/login" style={{ color: "#667eea" }}>
              /admin/login
            </a>{" "}
            in this browser, log in, then reload this page.
          </p>
        </div>
      </div>
    );
  }

  const secondsSinceUpdate = lastUpdated
    ? Math.floor((currentTime - lastUpdated) / 1000)
    : null;
  const isStale = secondsSinceUpdate !== null && secondsSinceUpdate > 15; // normal poll is every 5s

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
            {/* Logos - all three organisations, since check-ins from any
                of them appear together on this shared display */}
            <div style={{ display: "flex", gap: "8px" }}>
              <img
                src="/logos/ahhc-logo.png"
                alt="AHHC"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain",
                  borderRadius: "50%",
                  background: "white",
                  padding: "3px",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
              />
              <img
                src="/logos/auf-logo.png"
                alt="AUF"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain",
                  borderRadius: "50%",
                  background: "white",
                  padding: "3px",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
              />
              <img
                src="/logos/awauk-logo.png"
                alt="AWA-UK"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain",
                  borderRadius: "50%",
                  background: "white",
                  padding: "3px",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                }}
              />
            </div>

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

      {/* Just Arrived - persistent spotlight, always shows the single most
          recent check-in, updates instantly, no timer needed */}
      <div
        style={{
          background: justArrived
            ? "linear-gradient(135deg, #064e3b 0%, #047857 100%)"
            : "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
          border: `2px solid ${justArrived ? "#10b981" : "#4b5563"}`,
          borderRadius: "20px",
          padding: "28px 36px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          boxShadow: justArrived
            ? "0 8px 40px rgba(16, 185, 129, 0.35)"
            : "none",
          transition: "all 0.4s ease",
        }}
      >
        <div style={{ fontSize: "3.5rem" }}>{justArrived ? "✅" : "⏳"}</div>
        <div>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: justArrived ? "#6ee7b7" : "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "6px",
            }}
          >
            Just Arrived
          </div>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#f9fafb",
              lineHeight: "1.1",
            }}
          >
            {justArrived ? justArrived.name : "Waiting for first check-in..."}
          </div>
          {justArrived && (
            <div
              style={{ fontSize: "1.1rem", color: "#9ca3af", marginTop: "6px" }}
            >
              👥{" "}
              {justArrived.under5 +
                justArrived.age5to12 +
                justArrived.age12plus}{" "}
              people
              {justArrived.checkInBy &&
                ` • checked in by ${justArrived.checkInBy}`}
            </div>
          )}
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

          {lastUpdated && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                borderRadius: "12px",
                textAlign: "center",
                background: isStale
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(107, 114, 128, 0.15)",
                border: `1px solid ${isStale ? "#ef4444" : "#374151"}`,
              }}
            >
              {isStale && (
                <div
                  style={{
                    color: "#fca5a5",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    marginBottom: "4px",
                  }}
                >
                  ⚠️ Data may be out of date
                </div>
              )}
              <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          )}
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

            {/* Scrolling Feed - auto-scrolls continuously via tickerRef,
                independent of the spotlight panel above */}
            <div
              ref={tickerRef}
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
                        background: "#111827",
                        borderRadius: "12px",
                        padding: "14px 18px",
                        marginBottom: "10px",
                        border: "1px solid #374151",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "1.15rem",
                              fontWeight: "700",
                              color: "#f9fafb",
                              marginBottom: "4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {person.name}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
                            👥{" "}
                            {person.under5 + person.age5to12 + person.age12plus}{" "}
                            people
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          🕐 {timeText}
                          {person.checkInBy && (
                            <div style={{ fontSize: "0.75rem" }}>
                              by {person.checkInBy}
                            </div>
                          )}
                        </div>
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
