"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "../../contexts/ConfigContext";

export default function CheckInScanner() {
  const config = useConfig();
  const [manualCode, setManualCode] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [scannerActive, setScannerActive] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volunteerStats, setVolunteerStats] = useState({ today: 0, total: 0 });

  const router = useRouter();

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      setAudioContext(ctx);

      const resumeAudio = () => {
        if (ctx.state === "suspended") {
          ctx.resume();
        }
      };
      document.addEventListener("touchstart", resumeAudio, { once: true });
      document.addEventListener("click", resumeAudio, { once: true });

      return () => {
        document.removeEventListener("touchstart", resumeAudio);
        document.removeEventListener("click", resumeAudio);
      };
    }
  }, []);

  // PLAY SUCCESS SOUND
  const playSuccessSound = () => {
    if (!soundEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);

      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1046;
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.15,
        );
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.15);
      }, 150);
    } catch (e) {
      console.log("Audio error:", e);
    }

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  // PLAY ERROR SOUND
  const playErrorSound = () => {
    if (!soundEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 200;
      oscillator.type = "sawtooth";

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Audio error:", e);
    }

    if (navigator.vibrate) {
      navigator.vibrate([300]);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("volunteerName");
    if (saved) setVolunteerName(saved);

    const soundPref = localStorage.getItem("soundEnabled");
    if (soundPref !== null) setSoundEnabled(soundPref === "true");

    // Load volunteer stats
    const savedStats = JSON.parse(
      localStorage.getItem("volunteerStats") || '{"today": 0, "total": 0}',
    );
    setVolunteerStats(savedStats);

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // QR SCANNER MANAGEMENT
  useEffect(() => {
    let html5QrCodeInstance = null;
    let isActive = true;
    let isScanning = false;

    if (scannerActive && typeof window !== "undefined") {
      import("html5-qrcode")
        .then(({ Html5Qrcode }) => {
          if (!isActive) return;

          html5QrCodeInstance = new Html5Qrcode("qr-reader");

          html5QrCodeInstance
            .start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              (decodedText) => {
                if (decodedText && !loading && isActive && isScanning) {
                  isScanning = false;
                  processCheckIn(decodedText);
                }
              },
              (error) => {},
            )
            .then(() => {
              if (isActive) {
                isScanning = true;
              }
            })
            .catch((err) => {
              console.error("Scanner start failed:", err);
              isScanning = false;
            });
        })
        .catch((err) => {
          console.error("Scanner import failed:", err);
        });
    }

    return () => {
      isActive = false;
      if (html5QrCodeInstance && isScanning) {
        isScanning = false;
        html5QrCodeInstance.stop().catch((err) => {
          console.log("Scanner stop (cleanup):", err.message);
        });
      }
    };
  }, [scannerActive, loading]);

  const fetchStats = async () => {
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
          .slice(0, 10);

        setRecentCheckIns(checkedInList);

        const checkedInCount = data.data.filter((r) => r.checkedIn).length;
        const paidCount = data.data.filter(
          (r) => r.paymentStatus === "paid",
        ).length;
        setStats({
          checkedIn: checkedInCount,
          total: paidCount,
          percentage:
            paidCount > 0 ? Math.round((checkedInCount / paidCount) * 100) : 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const processCheckIn = async (code) => {
    if (!code || code === lastScannedCode) return;

    setLastScannedCode(code);
    setLoading(true);
    setResult(null);

    try {
      if (volunteerName) {
        localStorage.setItem("volunteerName", volunteerName);
      }

      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          volunteerName: volunteerName || "Volunteer",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update volunteer stats
        const newStats = {
          today: volunteerStats.today + 1,
          total: volunteerStats.total + 1,
        };
        setVolunteerStats(newStats);
        localStorage.setItem("volunteerStats", JSON.stringify(newStats));

        playSuccessSound();
        setResult({
          type: "success",
          message: data.message,
          data: data.data,
        });
        setManualCode("");
        fetchStats();

        setTimeout(() => {
          setResult(null);
          setLastScannedCode("");
          setLoading(false);
        }, 2000);
      } else if (data.alreadyCheckedIn) {
        playErrorSound();
        setResult({
          type: "warning",
          message: data.message,
          data: data.data,
        });

        setTimeout(() => {
          setResult(null);
          setLastScannedCode("");
          setLoading(false);
        }, 2000);
      } else if (data.paymentPending) {
        playErrorSound();
        setResult({
          type: "error",
          message: data.message,
          data: data.data,
        });

        setTimeout(() => {
          setResult(null);
          setLastScannedCode("");
          setLoading(false);
        }, 3000);
      } else {
        playErrorSound();
        setResult({
          type: "error",
          message: data.error || "Check-in failed",
        });

        setTimeout(() => {
          setResult(null);
          setLastScannedCode("");
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      playErrorSound();
      setResult({
        type: "error",
        message: "Network error. Please try again.",
      });

      setTimeout(() => {
        setResult(null);
        setLastScannedCode("");
        setLoading(false);
      }, 2000);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setResult({ type: "error", message: "Please enter a code" });
      setTimeout(() => setResult(null), 2000);
      return;
    }
    processCheckIn(manualCode);
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("soundEnabled", newValue.toString());

    if (newValue && audioContext) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1,
      );
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.1);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
            border: "1px solid #374151",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#f9fafb",
              marginBottom: "6px",
            }}
          >
            🎫 Check-In Scanner
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
            {config.event.fullName}
          </p>
        </div>

        {/* Two-Column Layout: Event Stats + Your Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {/* Event Stats */}
          {stats && (
            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #374151",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginBottom: "4px",
                }}
              >
                Event Progress
              </div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "#10b981",
                  marginBottom: "8px",
                }}
              >
                {stats.checkedIn}/{stats.total}
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#374151",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${stats.percentage}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10b981, #667eea)",
                    transition: "width 0.5s",
                  }}
                />
              </div>
            </div>
          )}

          {/* YOUR STATS CARD */}
          <div
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              borderRadius: "12px",
              padding: "16px",
              border: "2px solid #8b5cf6",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "#e9d5ff",
                marginBottom: "4px",
              }}
            >
              You Checked In
            </div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "white",
                marginBottom: "4px",
              }}
            >
              {volunteerStats.today} 🌟
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#e9d5ff",
                fontWeight: "600",
              }}
            >
              {volunteerStats.today === 0
                ? "Start scanning!"
                : volunteerStats.today < 5
                  ? "Great start!"
                  : volunteerStats.today < 15
                    ? "On fire! 🔥"
                    : volunteerStats.today < 30
                      ? "Superstar! ⭐"
                      : "Legend! 🏆"}
            </div>
          </div>
        </div>

        {/* QR SCANNER */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "2px solid #10b981",
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  background: "#10b981",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}
              />
              SCANNER ACTIVE
            </div>
            <button
              onClick={toggleSound}
              style={{
                padding: "6px 12px",
                background: soundEnabled ? "#10b981" : "#4b5563",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {soundEnabled ? "🔊 ON" : "🔇 OFF"}
            </button>
          </div>

          {scannerActive ? (
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                background: "#000",
              }}
            >
              <div
                id="qr-reader"
                style={{
                  width: "100%",
                  border: "none",
                }}
              />
              <p
                style={{
                  textAlign: "center",
                  color: "#10b981",
                  fontSize: "1rem",
                  fontWeight: "600",
                  padding: "12px",
                  margin: 0,
                  background: "#1f2937",
                }}
              >
                📱 Point at QR Code
              </p>
            </div>
          ) : (
            <button
              onClick={() => setScannerActive(true)}
              style={{
                width: "100%",
                padding: "20px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.25rem",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📷 Start Scanner
            </button>
          )}
        </div>

        {/* Volunteer Name - COLLAPSED */}
        <details
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #374151",
          }}
        >
          <summary
            style={{
              color: "#9ca3af",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            👤 Set Your Name (optional)
          </summary>

          <div style={{ marginTop: "12px" }}>
            <input
              type="text"
              value={volunteerName}
              onChange={(e) => {
                setVolunteerName(e.target.value);
                localStorage.setItem("volunteerName", e.target.value);
              }}
              placeholder="Enter your name"
              style={{
                width: "100%",
                padding: "12px",
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "8px",
                marginBottom: 0,
              }}
            >
              Your name will appear in check-in records
            </p>
          </div>
        </details>

        {/* Manual Entry - COLLAPSED */}
        <details
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #374151",
          }}
        >
          <summary
            style={{
              color: "#9ca3af",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ⌨️ Manual Entry (if QR won't scan)
          </summary>

          <form onSubmit={handleManualSubmit} style={{ marginTop: "12px" }}>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="AHHC..."
              inputMode="text"
              autoCapitalize="characters"
              style={{
                width: "100%",
                padding: "16px",
                background: "#111827",
                border: "2px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6",
                fontSize: "1.25rem",
                fontWeight: "600",
                outline: "none",
                textAlign: "center",
                letterSpacing: "3px",
                marginBottom: "12px",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading ? "#4b5563" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.125rem",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "⏳ Processing..." : "✅ Check In"}
            </button>
          </form>
        </details>

        {/* RESULT OVERLAY */}
        {result && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.95)",
              backdropFilter: "blur(8px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div
              style={{
                background:
                  result.type === "success"
                    ? "linear-gradient(135deg, #064e3b 0%, #047857 100%)"
                    : result.type === "warning"
                      ? "linear-gradient(135deg, #78350f 0%, #92400e 100%)"
                      : "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
                borderRadius: "24px",
                padding: "48px 32px",
                maxWidth: "90%",
                width: "400px",
                textAlign: "center",
                border: `3px solid ${
                  result.type === "success"
                    ? "#10b981"
                    : result.type === "warning"
                      ? "#f59e0b"
                      : "#ef4444"
                }`,
                boxShadow: `0 20px 60px ${
                  result.type === "success"
                    ? "rgba(16, 185, 129, 0.5)"
                    : result.type === "warning"
                      ? "rgba(245, 158, 11, 0.5)"
                      : "rgba(239, 68, 68, 0.5)"
                }`,
                animation:
                  result.type === "success"
                    ? "scaleInBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "shakeIn 0.3s ease-out",
              }}
            >
              <div
                style={{
                  fontSize: "100px",
                  lineHeight: "1",
                  marginBottom: "16px",
                  animation: "iconPulse 0.6s ease-out",
                }}
              >
                {result.type === "success"
                  ? "✅"
                  : result.type === "warning"
                    ? "⚠️"
                    : "❌"}
              </div>

              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color:
                    result.type === "success"
                      ? "#10b981"
                      : result.type === "warning"
                        ? "#fbbf24"
                        : "#fca5a5",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {result.type === "success" ? "CHECKED IN" : result.message}
              </div>

              {result.data && (
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#f9fafb",
                      marginBottom: "8px",
                    }}
                  >
                    {result.data.name}
                  </div>

                  {result.data.totalGuests && (
                    <div
                      style={{
                        fontSize: "1.125rem",
                        color: "#d1d5db",
                        fontWeight: "600",
                      }}
                    >
                      🎫 {result.data.totalGuests} people
                    </div>
                  )}

                  {result.data.checkInTime && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#9ca3af",
                        marginTop: "8px",
                      }}
                    >
                      {new Date(result.data.checkInTime).toLocaleString(
                        "en-GB",
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Check-Ins */}
        {recentCheckIns.length > 0 && (
          <div
            style={{
              background: "#1f2937",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px",
              border: "1px solid #374151",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#f9fafb",
                margin: "0 0 12px 0",
              }}
            >
              ✅ Recent Check-Ins
            </h3>

            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {recentCheckIns.slice(0, 5).map((person, index) => {
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
                      padding: "10px",
                      background: index === 0 ? "#064e3b" : "#111827",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      border: `1px solid ${
                        index === 0 ? "#10b981" : "#374151"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#f9fafb",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                          }}
                        >
                          {person.name}
                        </div>
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: "0.75rem",
                          }}
                        >
                          {person.under5 + person.age5to12 + person.age12plus}{" "}
                          people • {timeText}
                        </div>
                      </div>

                      {index === 0 && (
                        <div
                          style={{
                            background: "#10b981",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            color: "white",
                          }}
                        >
                          NEW
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <button
            onClick={() => router.push("/admin")}
            style={{
              padding: "12px",
              background: "#374151",
              color: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            ← Admin
          </button>
          <button
            onClick={() => window.open("/checkin/display", "_blank")}
            style={{
              padding: "12px",
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            📺 Display
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleInBounce {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shakeIn {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes iconPulse {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        details summary {
          list-style: none;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </div>
  );
}
