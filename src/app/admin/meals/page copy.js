"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminMealsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [mealTotals, setMealTotals] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tokenStats, setTokenStats] = useState({
    needingTokens: 0,
    withTokens: 0,
  });
  const [generatingTokens, setGeneratingTokens] = useState(false);
  const [viewingMeal, setViewingMeal] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [updatingDeadline, setUpdatingDeadline] = useState(false);
  const [currentDeadline, setCurrentDeadline] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchMealData();
    fetchTokenStats();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMealData();
      fetchTokenStats();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchTokenStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/generate-meal-tokens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTokenStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch token stats:", error);
    }
  };

  const generateTokens = async () => {
    if (
      !confirm(
        `Generate meal tokens for ${tokenStats.needingTokens} paid RSVPs?`
      )
    )
      return;

    setGeneratingTokens(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/generate-meal-tokens", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        fetchTokenStats();
        fetchMealData();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to generate tokens" });
    } finally {
      setGeneratingTokens(false);
    }
  };

  const fetchMealData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/meal-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      // Debug logging
      console.log("API Response:", data);
      console.log("RSVPs count:", data.rsvps?.length);
      console.log(
        "First RSVP deadline:",
        data.rsvps?.[0]?.mealSelectionDeadline
      );

      if (response.ok) {
        setStats(data.stats);
        setMealTotals(data.mealTotals);
        setRsvps(data.rsvps);

        // Set current deadline from first RSVP
        if (data.rsvps.length > 0 && data.rsvps[0].mealSelectionDeadline) {
          setCurrentDeadline(data.rsvps[0].mealSelectionDeadline);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppLink = (rsvp) => {
    const baseUrl = window.location.origin;
    const mealLink = `${baseUrl}/meals/${rsvp.mealSelectionToken}`;

    const message = `Assalamu Alaikum ${rsvp.name}!

Thank you for confirming your payment for AHHC Family Get-Together 2026! 

Please select meal choices for your family:
${mealLink}

Your booking:
- ${rsvp.under5} x Under 5
- ${rsvp.age5to12} x Age 5-12
- ${rsvp.age12plus} x Age 12+

⏰ Deadline: Wednesday, 14th January 2026 at 6:00PM

JazakAllah Khair,
AHHC Team`;

    navigator.clipboard.writeText(message).then(() => {
      setMessage({ type: "success", text: "Copied! Opening WhatsApp..." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(
          `whatsapp://send?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      } else {
        window.open("https://web.whatsapp.com/", "_blank");
      }
    });
  };

  const exportCateringReport = () => {
    const headers = [
      "Family Name",
      "Phone",
      "Under 5 - Nuggets",
      "Under 5 - Not Required",
      "Age 5-12 - Rice & Curry",
      "Age 5-12 - Burger Meal",
      "Age 12+ - Rice & Curry",
      "Age 12+ - Burger Meal",
      "Dietary Requirements",
      "Status",
      "Submitted At",
    ];

    const rows = rsvps.map((rsvp) => {
      const under5Nuggets =
        rsvp.mealSelections?.filter(
          (m) => m.ageCategory === "under5" && m.mealChoice === "nuggets-chips"
        ).length || 0;

      const under5NotRequired =
        rsvp.mealSelections?.filter(
          (m) => m.ageCategory === "under5" && m.mealChoice === "not-required"
        ).length || 0;

      const age5to12Rice =
        rsvp.mealSelections?.filter(
          (m) => m.ageCategory === "age5to12" && m.mealChoice === "rice-curry"
        ).length || 0;

      const age5to12Burger =
        rsvp.mealSelections?.filter(
          (m) => m.ageCategory === "age5to12" && m.mealChoice === "burger-meal"
        ).length || 0;

      const age12plusRice =
        rsvp.mealSelections?.filter(
          (m) => m.ageCategory === "age12plus" && m.mealChoice === "rice-curry"
        ).length || 0;

      const age12plusBurger =
        rsvp.mealSelections?.filter(
          (m) => m.ageCategory === "age12plus" && m.mealChoice === "burger-meal"
        ).length || 0;

      return [
        rsvp.name,
        rsvp.phone,
        under5Nuggets,
        under5NotRequired,
        age5to12Rice,
        age5to12Burger,
        age12plusRice,
        age12plusBurger,
        rsvp.dietaryRestrictions || "",
        rsvp.mealSelectionComplete ? "Complete" : "Pending",
        rsvp.submittedAt ? new Date(rsvp.submittedAt).toLocaleString() : "",
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ahhc-catering-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateDeadlineForAll = async () => {
    if (!newDeadline) {
      setMessage({ type: "error", text: "Please select a deadline" });
      return;
    }

    if (
      !confirm(
        `Update meal deadline for ALL ${stats.total} families to ${new Date(
          newDeadline
        ).toLocaleString("en-GB")}?`
      )
    ) {
      return;
    }

    setUpdatingDeadline(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/update-meal-deadline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deadline: newDeadline }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Deadline updated for ${data.count} RSVPs`,
        });
        setShowDeadlineModal(false);
        fetchMealData();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update deadline",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update deadline" });
    } finally {
      setUpdatingDeadline(false);
    }
  };

  const filteredRsvps = rsvps.filter((rsvp) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      rsvp.name.toLowerCase().includes(searchLower) ||
      rsvp.phone.includes(search)
    );
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#9ca3af" }}>Loading meal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111827", padding: "16px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #374151",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(1.25rem, 5vw, 1.75rem)",
              fontWeight: "700",
              color: "#f9fafb",
              marginBottom: "8px",
            }}
          >
            🍽️ Meal Management
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
            AHHC Family Get-Together 2026
          </p>
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => router.push("/admin")}
              style={{
                padding: "10px 16px",
                background: "#374151",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              ← Back
            </button>
            <button
              onClick={exportCateringReport}
              style={{
                padding: "10px 16px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              📥 Export
            </button>
          </div>
        </div>

        {/* Deadline Control */}
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
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#f9fafb",
                  marginBottom: "8px",
                }}
              >
                ⏰ Submission Deadline
              </h3>
              {currentDeadline ? (
                <p
                  style={{
                    color: "#10b981",
                    fontSize: "0.95rem",
                    margin: 0,
                    fontWeight: "600",
                  }}
                >
                  {new Date(currentDeadline).toLocaleString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : (
                <p
                  style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}
                >
                  No deadline set
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDeadlineModal(true)}
              style={{
                padding: "10px 16px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              📅 Change Deadline
            </button>
          </div>
        </div>

        {/* Deadline Modal */}
        {showDeadlineModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setShowDeadlineModal(false)}
          >
            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "500px",
                width: "100%",
                border: "1px solid #374151",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#f9fafb",
                  marginBottom: "24px",
                }}
              >
                📅 Update Meal Deadline
              </h3>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#f3f4f6",
                    marginBottom: "8px",
                  }}
                >
                  New Deadline Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
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
                    color: "#9ca3af",
                    fontSize: "0.75rem",
                    marginTop: "8px",
                  }}
                >
                  This will update the deadline for ALL {stats?.total || 0}{" "}
                  families
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setShowDeadlineModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#374151",
                    color: "#f3f4f6",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={updateDeadlineForAll}
                  disabled={updatingDeadline || !newDeadline}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: updatingDeadline ? "#4b5563" : "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor:
                      updatingDeadline || !newDeadline
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {updatingDeadline ? "⏳ Updating..." : "✅ Update Deadline"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "20px",
              background: message.type === "success" ? "#064e3b" : "#7f1d1d",
              color: message.type === "success" ? "#10b981" : "#ef4444",
              border: `1px solid ${
                message.type === "success" ? "#10b981" : "#ef4444"
              }40`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Token Generation Warning */}
        {tokenStats.needingTokens > 0 && (
          <div
            style={{
              background: "#7f1d1d",
              border: "2px solid #ef4444",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#fca5a5",
                    marginBottom: "8px",
                  }}
                >
                  ⚠️ Meal Tokens Missing
                </h3>
                <p
                  style={{ color: "#fecaca", fontSize: "0.875rem", margin: 0 }}
                >
                  <strong>{tokenStats.needingTokens}</strong> paid RSVPs don't
                  have meal tokens yet.
                </p>
              </div>
              <button
                onClick={generateTokens}
                disabled={generatingTokens}
                style={{
                  padding: "10px 16px",
                  background: generatingTokens ? "#4b5563" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: generatingTokens ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                }}
              >
                {generatingTokens ? "⏳ Generating..." : "🎫 Generate Tokens"}
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards - Mobile Responsive */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #374151",
                borderLeft: "4px solid #667eea",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Total Families
              </div>
              <div
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                  fontWeight: "700",
                  color: "#f9fafb",
                }}
              >
                {stats.total}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginTop: "4px",
                }}
              >
                With meal tokens
              </div>
            </div>

            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #374151",
                borderLeft: "4px solid #10b981",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Completed
              </div>
              <div
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                  fontWeight: "700",
                  color: "#10b981",
                }}
              >
                {stats.completed}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#10b981",
                  marginTop: "4px",
                  fontWeight: "600",
                }}
              >
                {stats.percentage}% Complete
              </div>
            </div>

            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #374151",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Pending
              </div>
              <div
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                  fontWeight: "700",
                  color: "#f59e0b",
                }}
              >
                {stats.pending}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginTop: "4px",
                }}
              >
                Need to submit
              </div>
            </div>
          </div>
        )}

        {/* Catering Totals */}
        {mealTotals && (
          <div
            style={{
              background: "#1f2937",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid #374151",
            }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#f9fafb",
                marginBottom: "16px",
              }}
            >
              📊 Catering Summary
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
              }}
            >
              {/* Under 5 */}
              <div
                style={{
                  background: "#111827",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Under 5
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6ee7b7",
                    marginBottom: "8px",
                  }}
                >
                  Nuggets & Chips
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: "700",
                    color: "#10b981",
                  }}
                >
                  {mealTotals.under5["nuggets-chips"]}
                </div>
              </div>
              <div
                style={{
                  background: "#111827",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Under 5
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    marginBottom: "8px",
                  }}
                >
                  Not Required
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: "700",
                    color: "#6b7280",
                  }}
                >
                  {mealTotals.under5["not-required"]}
                </div>
              </div>

              {/* Age 5-12 */}
              <div
                style={{
                  background: "#111827",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Age 5-12
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#a5b4fc",
                    marginBottom: "8px",
                  }}
                >
                  Rice & Curry
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: "700",
                    color: "#667eea",
                  }}
                >
                  {mealTotals.age5to12["rice-curry"]}
                </div>
              </div>
              <div
                style={{
                  background: "#111827",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Age 5-12
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#fcd34d",
                    marginBottom: "8px",
                  }}
                >
                  Burger Meal
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: "700",
                    color: "#f59e0b",
                  }}
                >
                  {mealTotals.age5to12["burger-meal"]}
                </div>
              </div>

              {/* Age 12+ */}
              <div
                style={{
                  background: "#111827",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Age 12+
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#a5b4fc",
                    marginBottom: "8px",
                  }}
                >
                  Rice & Curry
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: "700",
                    color: "#667eea",
                  }}
                >
                  {mealTotals.age12plus["rice-curry"]}
                </div>
              </div>
              <div
                style={{
                  background: "#111827",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9ca3af",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Age 12+
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#fcd34d",
                    marginBottom: "8px",
                  }}
                >
                  Burger Meal
                </div>
                <div
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: "700",
                    color: "#f59e0b",
                  }}
                >
                  {mealTotals.age12plus["burger-meal"]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            border: "1px solid #374151",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "0.875rem",
              outline: "none",
              background: "#111827",
              color: "#f3f4f6",
            }}
          />
        </div>

        {/* Desktop Table */}
        <div
          className="desktop-table"
          style={{
            background: "#1f2937",
            borderRadius: "12px",
            border: "1px solid #374151",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
              }}
            >
              <thead
                style={{
                  background: "#111827",
                  borderBottom: "1px solid #374151",
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Attendees
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ padding: "64px", textAlign: "center" }}
                    >
                      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>
                        📭
                      </div>
                      <p
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: "600",
                          color: "#f3f4f6",
                        }}
                      >
                        No RSVPs found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    // <tr
                    //   key={rsvp._id}
                    //   style={{
                    //     borderBottom: "1px solid #374151",
                    //     transition: "background-color 0.2s",
                    //   }}
                    //   onMouseEnter={(e) =>
                    //     (e.currentTarget.style.backgroundColor = "#374151")
                    //   }
                    //   onMouseLeave={(e) =>
                    //     (e.currentTarget.style.backgroundColor = "transparent")
                    //   }
                    // >

                    <tr
                      key={rsvp._id}
                      style={{
                        borderBottom: "1px solid #374151",
                        transition: "background-color 0.2s",
                        backgroundColor: rsvp.dietaryRestrictions
                          ? "#6f4040"
                          : "transparent", // Red background if has dietary notes
                        borderLeft: rsvp.dietaryRestrictions
                          ? "4px solid #ef4444"
                          : "none", // Red border indicator
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          rsvp.dietaryRestrictions ? "#991b1b" : "#374151";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          rsvp.dietaryRestrictions ? "#7f1d1d" : "transparent";
                      }}
                    >
                      <td style={{ padding: "16px" }}>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#f9fafb",
                            marginBottom: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {rsvp.name}
                          {rsvp.dietaryRestrictions && (
                            <span
                              style={{
                                background: "#ef4444",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                              }}
                              title={rsvp.dietaryRestrictions}
                            >
                              ⚠️ ALLERGY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                          {rsvp.phone}
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.875rem", color: "#f3f4f6" }}>
                          U5: {rsvp.under5} | 5-12: {rsvp.age5to12} | 12+:{" "}
                          {rsvp.age12plus}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                            marginTop: "4px",
                          }}
                        >
                          Total: {rsvp.under5 + rsvp.age5to12 + rsvp.age12plus}
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {rsvp.mealSelectionComplete ? (
                          <span
                            style={{
                              padding: "6px 12px",
                              background: "#064e3b",
                              color: "#10b981",
                              borderRadius: "6px",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                            }}
                          >
                            ✅ Complete
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "6px 12px",
                              background: "#78350f",
                              color: "#f59e0b",
                              borderRadius: "6px",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                            }}
                          >
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => sendWhatsAppLink(rsvp)}
                            style={{
                              padding: "8px 12px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            💬 Send
                          </button>
                          {rsvp.mealSelectionComplete && (
                            <button
                              onClick={() => setViewingMeal(rsvp)}
                              style={{
                                padding: "8px 12px",
                                background: "#667eea",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              👁️ View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-cards" style={{ display: "none" }}>
          {filteredRsvps.length === 0 ? (
            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "48px 20px",
                textAlign: "center",
                border: "1px solid #374151",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
              <p
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#f3f4f6",
                  marginBottom: "8px",
                }}
              >
                No RSVPs found
              </p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                {search ? "Try adjusting filters" : "RSVPs will appear here"}
              </p>
            </div>
          ) : (
            filteredRsvps.map((rsvp) => (
              <div
                key={rsvp._id}
                style={{
                  background: rsvp.dietaryRestrictions ? "#6d3939" : "#1f2937",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "12px",
                  border: rsvp.dietaryRestrictions
                    ? "2px solid #ef4444"
                    : "1px solid #374151",
                  borderLeft: rsvp.dietaryRestrictions
                    ? "6px solid #ef4444"
                    : "1px solid #374151",
                }}
              >
                {/* Name */}
                <div
                  style={{
                    fontWeight: "600",
                    color: "#f9fafb",
                    fontSize: "1rem",
                    marginBottom: "4px",
                  }}
                >
                  {rsvp.name}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                    marginBottom: "12px",
                  }}
                >
                  {rsvp.phone}
                </div>

                {/* Attendees */}
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      marginBottom: "8px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Attendees
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <span
                      style={{
                        padding: "6px 10px",
                        background: "#374151",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        color: "#f3f4f6",
                        fontWeight: "600",
                      }}
                    >
                      U5: {rsvp.under5}
                    </span>
                    <span
                      style={{
                        padding: "6px 10px",
                        background: "#374151",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        color: "#f3f4f6",
                        fontWeight: "600",
                      }}
                    >
                      5-12: {rsvp.age5to12}
                    </span>
                    <span
                      style={{
                        padding: "6px 10px",
                        background: "#374151",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        color: "#f3f4f6",
                        fontWeight: "600",
                      }}
                    >
                      12+: {rsvp.age12plus}
                    </span>
                    <span
                      style={{
                        padding: "6px 10px",
                        background: "#10b981",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        color: "#ffffff",
                        fontWeight: "700",
                      }}
                    >
                      Total: {rsvp.under5 + rsvp.age5to12 + rsvp.age12plus}
                    </span>
                  </div>
                </div>

                {/* Status and Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    {rsvp.mealSelectionComplete ? (
                      <span
                        style={{
                          padding: "6px 12px",
                          background: "#064e3b",
                          color: "#10b981",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          display: "inline-block",
                        }}
                      >
                        ✅ Complete
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: "6px 12px",
                          background: "#78350f",
                          color: "#f59e0b",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          display: "inline-block",
                        }}
                      >
                        ⏳ Pending
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => sendWhatsAppLink(rsvp)}
                      style={{
                        padding: "8px 12px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      💬 Send
                    </button>
                    {rsvp.mealSelectionComplete && (
                      <button
                        onClick={() => setViewingMeal(rsvp)}
                        style={{
                          padding: "8px 12px",
                          background: "#667eea",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        👁️ View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Meal Modal */}
        {viewingMeal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setViewingMeal(null)}
          >
            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "600px",
                width: "100%",
                border: "1px solid #374151",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  fontSize: "clamp(1.25rem, 4vw, 1.5rem)",
                  fontWeight: "700",
                  color: "#f9fafb",
                  marginBottom: "24px",
                }}
              >
                🍽️ {viewingMeal.name} - Meal Selections
              </h3>

              <div style={{ marginBottom: "20px" }}>
                {viewingMeal.under5 > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4
                      style={{
                        color: "#9ca3af",
                        fontSize: "0.875rem",
                        marginBottom: "8px",
                      }}
                    >
                      Under 5 ({viewingMeal.under5}):
                    </h4>
                    {viewingMeal.mealSelections
                      ?.filter((m) => m.ageCategory === "under5")
                      .map((meal, i) => (
                        <div
                          key={i}
                          style={{
                            color: "#f3f4f6",
                            fontSize: "0.875rem",
                            marginLeft: "16px",
                          }}
                        >
                          •{" "}
                          {meal.mealChoice === "nuggets-chips"
                            ? "🍗 Nuggets & Chips"
                            : "❌ Not Required"}
                        </div>
                      ))}
                  </div>
                )}

                {viewingMeal.age5to12 > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4
                      style={{
                        color: "#9ca3af",
                        fontSize: "0.875rem",
                        marginBottom: "8px",
                      }}
                    >
                      Age 5-12 ({viewingMeal.age5to12}):
                    </h4>
                    {viewingMeal.mealSelections
                      ?.filter((m) => m.ageCategory === "age5to12")
                      .map((meal, i) => (
                        <div
                          key={i}
                          style={{
                            color: "#f3f4f6",
                            fontSize: "0.875rem",
                            marginLeft: "16px",
                          }}
                        >
                          •{" "}
                          {meal.mealChoice === "rice-curry"
                            ? "🍛 Rice & Curry"
                            : "🍔 Burger Meal"}
                        </div>
                      ))}
                  </div>
                )}

                {viewingMeal.age12plus > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4
                      style={{
                        color: "#9ca3af",
                        fontSize: "0.875rem",
                        marginBottom: "8px",
                      }}
                    >
                      Age 12+ ({viewingMeal.age12plus}):
                    </h4>
                    {viewingMeal.mealSelections
                      ?.filter((m) => m.ageCategory === "age12plus")
                      .map((meal, i) => (
                        <div
                          key={i}
                          style={{
                            color: "#f3f4f6",
                            fontSize: "0.875rem",
                            marginLeft: "16px",
                          }}
                        >
                          •{" "}
                          {meal.mealChoice === "rice-curry"
                            ? "🍛 Rice & Curry"
                            : "🍔 Burger Meal"}
                        </div>
                      ))}
                  </div>
                )}

                {viewingMeal.dietaryRestrictions && (
                  <div>
                    <h4
                      style={{
                        color: "#9ca3af",
                        fontSize: "0.875rem",
                        marginBottom: "8px",
                      }}
                    >
                      Dietary Requirements:
                    </h4>
                    <p
                      style={{
                        color: "#f3f4f6",
                        fontSize: "0.875rem",
                        marginLeft: "16px",
                      }}
                    >
                      {viewingMeal.dietaryRestrictions}
                    </p>
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginBottom: "20px",
                }}
              >
                Submitted: {new Date(viewingMeal.submittedAt).toLocaleString()}
              </div>

              <button
                onClick={() => setViewingMeal(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#374151",
                  color: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-table {
            display: none !important;
          }
          .mobile-cards {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-cards {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
