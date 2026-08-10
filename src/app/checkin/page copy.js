"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

export default function CheckInScanner() {
  const [manualCode, setManualCode] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ADD THIS

  const router = useRouter();

  const playSuccessSound = () => {
    try {
      // Create simple beep using Web Audio API (works better on mobile)
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // High pitch
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log("Audio generation failed:", e);
    }

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Double vibration
    }
  };

  useEffect(() => {
    // Load volunteer name from storage
    const saved = localStorage.getItem("volunteerName");
    if (saved) setVolunteerName(saved);

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let html5QrCodeInstance = null;
    let isActive = true;
    let isScanning = false; // ADD THIS - track if actually scanning

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
              },
              (decodedText) => {
                if (decodedText && !loading && isActive && isScanning) {
                  isScanning = false; // Mark as stopped
                  // STOP CAMERA IMMEDIATELY
                  html5QrCodeInstance
                    .stop()
                    .then(() => {
                      setScannerActive(false);
                      processCheckIn(decodedText);
                    })
                    .catch((err) => {
                      console.error("Stop error:", err);
                      // Even if stop fails, process check-in
                      setScannerActive(false);
                      processCheckIn(decodedText);
                    });
                }
              },
              () => {} // Empty error handler
            )
            .then(() => {
              if (isActive) {
                isScanning = true; // Mark as successfully started
              }
            })
            .catch((err) => {
              console.error("Unable to start scanning", err);
              isScanning = false;
            });
        })
        .catch((err) => {
          console.error("Scanner initialization error:", err);
        });
    }

    return () => {
      isActive = false;
      if (html5QrCodeInstance && isScanning) {
        isScanning = false;
        html5QrCodeInstance.stop().catch((err) => {
          // Silently catch stop errors during cleanup
          console.log(
            "Cleanup stop (expected if already stopped):",
            err.message
          );
        });
      }
    };
  }, [scannerActive]); // Only scannerActive dependency

  // Play sound when modal shows - iOS compatible
  useEffect(() => {
    if (result?.type === "success") {
      // Small delay ensures modal is mounted
      setTimeout(() => {
        const audio = new Audio(
          "data:audio/wav;base64,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"
        );
        audio.volume = 1.0;
        audio.play().catch((e) => console.log("Audio blocked:", e));

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]); // Double vibration
        }
      }, 100);
    }
  }, [result]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/rsvps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        // ADD THIS ENTIRE BLOCK:
        const checkedInList = data.data
          .filter((r) => r.checkedIn)
          .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
          .slice(0, 10);

        setRecentCheckIns(checkedInList);

        const checkedInCount = data.data.filter((r) => r.checkedIn).length;
        const paidCount = data.data.filter(
          (r) => r.paymentStatus === "paid"
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
    if (!code || code === lastScannedCode) return; // Prevent duplicate scans

    setLastScannedCode(code);
    setLoading(true);
    setResult(null);

    try {
      // Save volunteer name
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
        setResult({
          type: "success",
          message: data.message,
          data: data.data,
        });
        setShowSuccessModal(true);
        setManualCode("");
        fetchStats();

        // Play sound and haptic
        playSuccessSound();

        // Auto-clear success message after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          setTimeout(() => {
            setResult(null);
            setLastScannedCode("");
          }, 300); // Wait for fade-out animation
        }, 2500);
      } else if (data.alreadyCheckedIn) {
        setResult({
          type: "warning",
          message: data.message,
          data: data.data,
        });
        setTimeout(() => {
          setResult(null);
          setLastScannedCode("");
        }, 4000);
      } else if (data.paymentPending) {
        setResult({
          type: "error",
          message: data.message,
          data: data.data,
        });
        setTimeout(() => {
          setResult(null);
          setLastScannedCode("");
        }, 4000);
      } else {
        setResult({
          type: "error",
          message: data.error || "Check-in failed",
        });
        setTimeout(() => {
          setResult(null);
          setLastScannedCode("");
        }, 3000);
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "Network error. Please try again.",
      });
      setTimeout(() => {
        setResult(null);
        setLastScannedCode("");
      }, 3000);
    } finally {
      setLoading(false);
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            border: "1px solid #374151",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "700",
              color: "#f9fafb",
              marginBottom: "8px",
            }}
          >
            🎫 Check-In Scanner
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
            AHHC Family Get-Together 2026
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div
            style={{
              background: "#1f2937",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid #374151",
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
              <div>
                <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                  Checked In
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#10b981",
                  }}
                >
                  {stats.checkedIn} / {stats.total}
                </div>
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "700",
                  color: "#667eea",
                }}
              >
                {stats.percentage}%
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#374151",
                borderRadius: "6px",
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

        {/* Volunteer Name */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #374151",
          }}
        >
          <label
            style={{
              display: "block",
              color: "#f3f4f6",
              marginBottom: "8px",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            Your Name (Volunteer)
          </label>
          <input
            type="text"
            value={volunteerName}
            onChange={(e) => setVolunteerName(e.target.value)}
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
        </div>

        {/* QR Scanner Toggle */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #374151",
          }}
        >
          <button
            onClick={() => setScannerActive(!scannerActive)}
            style={{
              width: "100%",
              padding: "16px",
              background: scannerActive ? "#7f1d1d" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.125rem",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {scannerActive ? "📷 Close Camera" : "📷 Open Camera Scanner"}
          </button>

          {/* QR Scanner */}
          {scannerActive && (
            <div
              style={{
                marginTop: "16px",
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
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  padding: "12px",
                  margin: 0,
                  background: "#1f2937",
                }}
              >
                Point camera at QR code to scan
              </p>
            </div>
          )}
        </div>

        {/* Manual Code Entry */}
        <form
          onSubmit={handleManualSubmit}
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            border: "1px solid #374151",
          }}
        >
          <label
            style={{
              display: "block",
              color: "#f3f4f6",
              marginBottom: "12px",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            Or Enter Code Manually
          </label>

          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="AHHC..."
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
              letterSpacing: "2px",
              marginBottom: "16px",
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

        {/* OVERLAY MODAL - For ALL message types */}
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
            onClick={() => {
              setResult(null);
              setLastScannedCode("");
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
                padding: result.type === "success" ? "48px 32px" : "32px 24px",
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
                    ? "scaleInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "shakeIn 0.4s ease-out",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* SUCCESS MODAL */}
              {result.type === "success" && (
                <>
                  {/* Animated Checkmark */}
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      margin: "0 auto 24px",
                      background: "#10b981",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 32px rgba(16, 185, 129, 0.6)",
                      animation: "checkmarkPulse 0.6s ease-out",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "64px",
                        lineHeight: "1",
                        color: "white",
                        animation: "checkmarkRotate 0.5s ease-out",
                      }}
                    >
                      ✓
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: "800",
                      color: "#10b981",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    CHECK-IN SUCCESS
                  </div>

                  {result.data && (
                    <div
                      style={{
                        background: "rgba(0, 0, 0, 0.4)",
                        borderRadius: "16px",
                        padding: "24px",
                        marginTop: "20px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.75rem",
                          fontWeight: "700",
                          color: "#f9fafb",
                          marginBottom: "12px",
                          wordBreak: "break-word",
                        }}
                      >
                        {result.data.name}
                      </div>

                      {result.data.totalGuests && (
                        <div
                          style={{
                            fontSize: "1.25rem",
                            color: "#d1d5db",
                            fontWeight: "600",
                          }}
                        >
                          🎫 {result.data.totalGuests} people
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* WARNING/ERROR MODAL */}
              {result.type !== "success" && (
                <>
                  <div
                    style={{
                      fontSize: "80px",
                      lineHeight: "1",
                      marginBottom: "20px",
                    }}
                  >
                    {result.type === "warning" ? "⚠️" : "❌"}
                  </div>

                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: result.type === "warning" ? "#fbbf24" : "#fca5a5",
                      marginBottom: "16px",
                      lineHeight: "1.3",
                    }}
                  >
                    {result.message}
                  </div>

                  {result.data && (
                    <div
                      style={{
                        background: "rgba(0, 0, 0, 0.4)",
                        borderRadius: "12px",
                        padding: "20px",
                        marginTop: "20px",
                      }}
                    >
                      <div
                        style={{
                          color: "#f3f4f6",
                          fontSize: "1.25rem",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        {result.data.name}
                      </div>
                      {result.data.checkInTime && (
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: "0.875rem",
                          }}
                        >
                          {new Date(result.data.checkInTime).toLocaleString(
                            "en-GB"
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setResult(null);
                      setLastScannedCode("");
                    }}
                    style={{
                      marginTop: "24px",
                      padding: "12px 32px",
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "12px",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Warning/Error Messages - Keep inline */}
        {result && result.type !== "success" && (
          <div
            style={{
              background: result.type === "warning" ? "#78350f" : "#7f1d1d",
              border: `2px solid ${
                result.type === "warning" ? "#f59e0b" : "#ef4444"
              }`,
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              {result.type === "warning" ? "⚠️" : "❌"}
            </div>

            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: result.type === "warning" ? "#f59e0b" : "#ef4444",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              {result.message}
            </div>

            {result.data && (
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  padding: "16px",
                  marginTop: "16px",
                }}
              >
                <div
                  style={{
                    color: "#f3f4f6",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {result.data.name}
                </div>
                {result.data.checkInTime && (
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginTop: "4px",
                    }}
                  >
                    Previously checked in at:{" "}
                    {new Date(result.data.checkInTime).toLocaleString("en-GB")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Check-Ins List */}
        {recentCheckIns.length > 0 && (
          <div
            style={{
              background: "#1f2937",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid #374151",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#f9fafb",
                  margin: 0,
                }}
              >
                ✅ Recently Checked In
              </h3>
              <button
                onClick={() => router.push("/admin")}
                style={{
                  padding: "6px 12px",
                  background: "#374151",
                  color: "#9ca3af",
                  border: "1px solid #4b5563",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                View All →
              </button>
            </div>

            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {recentCheckIns.map((person, index) => {
                const timeAgo = Math.floor(
                  (Date.now() - new Date(person.checkInTime)) / 1000
                );
                const timeText =
                  timeAgo < 60
                    ? "Just now"
                    : timeAgo < 3600
                    ? `${Math.floor(timeAgo / 60)}m ago`
                    : new Date(person.checkInTime).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                return (
                  <div
                    key={person._id}
                    style={{
                      padding: "12px",
                      background: index === 0 ? "#064e3b" : "#111827",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      border: `1px solid ${
                        index === 0 ? "#10b981" : "#374151"
                      }`,
                      animation: index === 0 ? "pulse 2s ease-in-out" : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "#f9fafb",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            marginBottom: "4px",
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
                        {person.checkInBy && (
                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: "0.7rem",
                              marginTop: "2px",
                            }}
                          >
                            by {person.checkInBy}
                          </div>
                        )}
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
                            whiteSpace: "nowrap",
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

        {/* Back to Admin */}
        <button
          onClick={() => router.push("/admin")}
          style={{
            width: "100%",
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
          ← Back to Admin
        </button>
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
          0% {
            transform: translateX(-10px);
            opacity: 0;
          }
          25% {
            transform: translateX(10px);
          }
          50% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes checkmarkPulse {
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

        @keyframes checkmarkRotate {
          from {
            transform: rotate(-180deg) scale(0);
            opacity: 0;
          }
          to {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
