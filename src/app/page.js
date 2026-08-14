
//src\app\page.js
"use client";

import { useState, useEffect } from "react";
import { useConfig } from "../contexts/ConfigContext";

export default function Home() {
  // ✅ STEP 1: Declare selectedOrg FIRST
  const [selectedOrg, setSelectedOrg] = useState("ahhc");
  
  // ✅ STEP 2: Declare formData SECOND
  const [formData, setFormData] = useState({
    organization: "ahhc",
    name: "",
    phone: "",
    email: "",
    under5: 0,
    age5to12: 0,
    age12plus: 0,
    paymentReference: "",
    notes: "",
  });

  // ✅ STEP 3: Declare config THIRD - initialize with contextConfig so never null
  const contextConfig = useConfig();
  const [config, setConfig] = useState(contextConfig);

  // ✅ STEP 4: NOW useEffect can use selectedOrg safely
  useEffect(() => {
    const loadConfig = async () => {
      try {
        let selectedConfig;
        if (selectedOrg === "ahhc") {
          const { ahhcConfig } = await import("../config/organizations/ahhc.config");
          selectedConfig = ahhcConfig;
        } else if (selectedOrg === "auf") {
          const { aufConfig } = await import("../config/organizations/auf.config");
          selectedConfig = aufConfig;
        } else if (selectedOrg === "awauk") {
          const { awaukConfig } = await import("../config/organizations/awauk.config");
          selectedConfig = awaukConfig;
        } else {
          selectedConfig = contextConfig;
        }
        setConfig(selectedConfig);
      } catch (error) {
        console.error("Error loading config:", error);
        setConfig(contextConfig);
      }
    };

    loadConfig();
  }, [selectedOrg, contextConfig]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Deadline state
  const [deadlineInfo, setDeadlineInfo] = useState(null);
  const [loadingDeadline, setLoadingDeadline] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch deadline and attendee info
  useEffect(() => {
    fetchDeadlineInfo();
  }, []);

  const fetchDeadlineInfo = async () => {
    try {
      const response = await fetch("/api/attendees");
      const data = await response.json();
      setDeadlineInfo(data);
    } catch (error) {
      console.error("Failed to fetch deadline info:", error);
    } finally {
      setLoadingDeadline(false);
    }
  };

  const calculateTotal = () => {
    const childTier = config.pricing.tiers.find((t) => t.id === "child");
    const adultTier = config.pricing.tiers.find((t) => t.id === "adult");
    return (
      (formData.age5to12 || 0) * childTier.price +
      (formData.age12plus || 0) * adultTier.price
    );
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("age") || name.includes("under")
          ? value === ""
            ? 0
            : parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          organization: selectedOrg,  // ADD THIS
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store submitted data for modal
        setSubmittedData({
          name: formData.name,
          phone: formData.phone,
          totalAmount: calculateTotal(),
          totalGuests: formData.under5 + formData.age5to12 + formData.age12plus,
        });

        // Show success modal
        setShowSuccessModal(true);

        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          under5: 0,
          age5to12: 0,
          age12plus: 0,
          paymentReference: "",
          notes: "",
        });

        // Clear any previous messages
        setMessage({ type: "", text: "" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to submit RSVP",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotal();
  const deadlinePassed = deadlineInfo?.deadlinePassed || false;
  //const deadlinePassed = "2026-01-15T22:00:00.000Z" < new Date().toISOString();

  // Badge color function
  const getBadgeStyle = (guestCount) => {
    if (guestCount >= 5) {
      return { background: "#8b5cf6", icon: "🟣" }; // Purple for 5+
    } else if (guestCount >= 3) {
      return { background: "#10b981", icon: "🟢" }; // Green for 3-4
    } else {
      return { background: "#3b82f6", icon: "🔵" }; // Blue for 1-2
    }
  };

  if (loadingDeadline) {
    return (
      <div
        style={{
          background: "#111827",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#9ca3af" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#111827",
        minHeight: "100vh",
        padding: "clamp(12px, 4vw, 24px)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#1f2937",
          borderRadius: "12px",
          padding: "clamp(16px, 5vw, 32px)",
          border: "1px solid #374151",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>

          {/* 3 Logos Row */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}>
            <img src="/logos/ahhc-logo.png" alt="AHHC" style={{ width: "70px", height: "70px", objectFit: "contain", borderRadius: "50%", background: "white", padding: "4px" }} />
            <img src="/logos/auf-logo.png" alt="AUF" style={{ width: "70px", height: "70px", objectFit: "contain", borderRadius: "50%", background: "white", padding: "4px" }} />
            <img src="/logos/awauk-logo.png" alt="AWA-UK" style={{ width: "70px", height: "70px", objectFit: "contain", borderRadius: "50%", background: "white", padding: "4px" }} />
          </div>

          {/* Event Title */}
          <h1 style={{
            color: "#667eea",
            fontSize: "1.6rem",
            marginBottom: "4px",
            fontWeight: "800",
            lineHeight: "1.3",
          }}>
            Akurana Day 2026
          </h1>
          <p style={{
            color: "#f3f4f6",
            fontSize: "1rem",
            fontWeight: "600",
            marginBottom: "4px",
          }}>
            All UK Akuranaites Grand Get Together
          </p>
          <p style={{
            color: "#9ca3af",
            fontSize: "0.875rem",
            margin: "0 0 24px 0",
          }}>
            AWA-UK • AUF • AHHC
          </p>

          {/* Organization Selection - Card Style */}
          <div style={{
            marginTop: "8px",
            paddingTop: "24px",
            borderTop: "1px solid #374151",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
              justifyContent: "center",
            }}>
              <div style={{
                height: "1px",
                flex: 1,
                background: "#374151",
              }} />
              <p style={{
                color: "#f3f4f6",
                fontSize: "0.875rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                margin: 0,
                whiteSpace: "nowrap",
              }}>
                I am booking from
              </p>
              <div style={{
                height: "1px",
                flex: 1,
                background: "#374151",
              }} />
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "clamp(6px, 2vw, 10px)",
            }}>
              {[
                { id: "ahhc", name: "AHHC", location: "Crawley", logo: "/logos/ahhc-logo.png" },
                { id: "auf", name: "AUF", location: "London", logo: "/logos/auf-logo.png" },
                { id: "awauk", name: "AWA-UK", location: "Leicester", logo: "/logos/awauk-logo.png" },
              ].map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setSelectedOrg(org.id);
                    setFormData({
                      organization: org.id,
                      name: "",
                      phone: "",
                      email: "",
                      under5: 0,
                      age5to12: 0,
                      age12plus: 0,
                      paymentReference: "",
                      notes: "",
                    });
                  }}
                  style={{
                    padding: "clamp(8px, 2vw, 12px) clamp(4px, 1.5vw, 8px)",
                    background: selectedOrg === org.id ? "#1e3a5f" : "#111827",
                    border: selectedOrg === org.id ? "2px solid #667eea" : "2px solid #374151",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                    boxShadow: selectedOrg === org.id ? "0 0 0 3px rgba(102,126,234,0.2)" : "none",
                    width: "100%",
                  }}
                >
                  <img
                    src={org.logo}
                    alt={org.name}
                    style={{
                      width: "clamp(32px, 8vw, 44px)",
                      height: "clamp(32px, 8vw, 44px)",
                      objectFit: "contain",
                      borderRadius: "50%",
                      background: "white",
                      padding: "3px",
                    }}
                  />
                  <div>
                    <div style={{
                      color: selectedOrg === org.id ? "#667eea" : "#f3f4f6",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                    }}>
                      {org.name}
                    </div>
              <div style={{
                      color: selectedOrg === org.id ? "#667eea" : "#f3f4f6",
                      fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
                      fontWeight: "700",
                    }}>
                      {org.name}
                    </div>
                    <div style={{
                      color: "#9ca3af",
                      fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)",
                    }}>
                      {org.location}
                    </div>      <div style={{
                      color: "#9ca3af",
                      fontSize: "0.7rem",
                    }}>
                      {org.location}
                    </div>
                  </div>
                  {selectedOrg === org.id && (
                    <div style={{
                      width: "20px",
                      height: "20px",
                      background: "#667eea",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      color: "white",
                      fontWeight: "700",
                    }}>✓</div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Organization Banner */}
            {selectedOrg && (
              <div style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: "linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)",
                border: "1px solid #667eea",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "#667eea",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "1rem",
                }}>
                  ✓
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{
                    color: "#9ca3af",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "2px",
                  }}>
                    Booking as
                  </div>
                  <div style={{
                    color: "#f3f4f6",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                  }}>
                    {selectedOrg === "ahhc" && "AHHC - Akurana Helping Hands Crawley"}
                    {selectedOrg === "auf" && "AUF - Akurana United Foundation, London"}
                    {selectedOrg === "awauk" && "AWA-UK - Akurana Welfare Association, Leicester"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Details Box */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              color: "#f3f4f6",
              fontSize: "1.125rem",
              marginTop: 0,
              marginBottom: "16px",
              fontWeight: "600",
            }}
          >
            📅 Event Details
          </h3>
          <p style={{ color: "#d1d5db", margin: "8px 0", fontSize: "0.9rem" }}>
            <strong style={{ color: "#f3f4f6" }}>Date:</strong>{" "}
            {config.event.displayDate}
          </p>
          <p style={{ color: "#d1d5db", margin: "8px 0", fontSize: "0.9rem" }}>
            <strong style={{ color: "#f3f4f6" }}>Time:</strong>{" "}
            {config.event.time}
          </p>
          <p style={{ color: "#d1d5db", margin: "8px 0", fontSize: "0.9rem" }}>
            <strong style={{ color: "#f3f4f6" }}>Venue:</strong>{" "}
            {config.event.venue}
          </p>
          <p
            style={{
              color: "#9ca3af",
              margin: "4px 0 8px 0",
              fontSize: "0.85rem",
              paddingLeft: "8px",
            }}
          >
            📍 {config.event.venueAddress}
          </p>
          <p
            style={{
              marginTop: "16px",
              fontWeight: "700",
              color: "#f59e0b",
              fontSize: "0.9rem",
            }}
          >
            ⏰ Payment Deadline:{" "}
            {deadlineInfo?.deadline
              ? (() => {
                  const date = new Date(deadlineInfo.deadline);
                  const day = date.getUTCDate();
                  const month = date.toLocaleDateString("en-GB", {
                    month: "long",
                    timeZone: "UTC",
                  });
                  const year = date.getUTCFullYear();
                  const hours = String(date.getUTCHours()).padStart(2, "0");
                  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
                  return `${day} ${month} ${year} at ${hours}:${minutes}`;
                })()
              : "Loading..."}
          </p>
        </div>

        {/* Deadline Passed Message + Attendee List */}
        {deadlinePassed ? (
          <>
            {/* Deadline Passed Alert */}
            <div
              style={{
                background: "#7f1d1d",
                border: "2px solid #ef4444",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏰</div>
              <h2
                style={{
                  color: "#fca5a5",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  marginBottom: "12px",
                  marginTop: 0,
                }}
              >
                RSVP Deadline Has Passed
              </h2>
              <p
                style={{
                  color: "#fecaca",
                  fontSize: "1rem",
                  margin: 0,
                }}
              >
                Unfortunately, we are no longer accepting RSVPs.
                <br />
                Registration closed on{" "}
                <strong>
                  {(() => {
                    const date = new Date(deadlineInfo.deadline);
                    const day = date.getUTCDate();
                    const month = date.toLocaleDateString("en-GB", {
                      month: "long",
                      timeZone: "UTC",
                    });
                    const year = date.getUTCFullYear();
                    const hours = String(date.getUTCHours()).padStart(2, "0");
                    const minutes = String(date.getUTCMinutes()).padStart(
                      2,
                      "0",
                    );
                    return `${day} ${month} ${year} at ${hours}:${minutes}`;
                  })()}
                </strong>
              </p>
            </div>

            {/* Attendee List - Clean & Professional */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              {/* Compact Header with Inline Stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <h3
                  style={{
                    color: "#f3f4f6",
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    margin: 0,
                  }}
                >
                  👥 Confirmed Attendees
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      background: "#1f2937",
                      borderRadius: "6px",
                      fontWeight: "600",
                      color: "#10b981",
                    }}
                  >
                    {deadlineInfo.stats.totalPeople} People
                  </span>
                  <span style={{ color: "#4b5563" }}>•</span>
                  <span
                    style={{
                      padding: "6px 12px",
                      background: "#1f2937",
                      borderRadius: "6px",
                      fontWeight: "600",
                      color: "#667eea",
                    }}
                  >
                    {deadlineInfo.stats.totalFamilies} Families
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="🔍 Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                    fontSize: "0.875rem",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#374151";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Attendee List - Scrollable */}
              <div
                className="attendee-list"
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {deadlineInfo.attendees
                  .filter((attendee) =>
                    attendee.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((attendee, index) => {
                    const badgeStyle = getBadgeStyle(attendee.totalGuests);
                    return (
                      <div
                        key={index}
                        style={{
                          padding: "14px",
                          background: "#1f2937",
                          borderRadius: "8px",
                          marginBottom: "10px",
                          border: "1px solid #374151",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "#374151",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#f3f4f6",
                              fontWeight: "700",
                              fontSize: "0.875rem",
                              flexShrink: 0,
                            }}
                          >
                            {attendee.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                color: "#f3f4f6",
                                fontWeight: "600",
                                fontSize: "0.9rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {attendee.name}
                            </div>
                            <div
                              style={{
                                color: "#9ca3af",
                                fontSize: "0.75rem",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {new Date(
                                attendee.registeredDate,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "6px 10px",
                            background: badgeStyle.background,
                            borderRadius: "6px",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {badgeStyle.icon} {attendee.totalGuests}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* No Results Message */}
              {searchQuery &&
                deadlineInfo.attendees.filter((attendee) =>
                  attendee.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                ).length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#9ca3af",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                      🔍
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>
                      No attendees found for "{searchQuery}"
                    </p>
                  </div>
                )}
            </div>
          </>
        ) : (
          <>
            {/* Payment Details Box */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  color: "#f3f4f6",
                  fontSize: "1.125rem",
                  marginTop: 0,
                  marginBottom: "16px",
                  fontWeight: "600",
                }}
              >
                💳 Payment Details
              </h3>
              <p
                style={{
                  color: "#d1d5db",
                  margin: "8px 0",
                  fontSize: "0.9rem",
                }}
              >
                <strong style={{ color: "#f3f4f6" }}>Bank:</strong>{" "}
                {config.payment.bankName}
              </p>
              <p
                style={{
                  color: "#d1d5db",
                  margin: "8px 0",
                  fontSize: "0.9rem",
                }}
              >
                <strong style={{ color: "#f3f4f6" }}>Account Name:</strong>{" "}
                {config.payment.accountName}
              </p>
              <p
                style={{
                  color: "#d1d5db",
                  margin: "8px 0",
                  fontSize: "0.9rem",
                }}
              >
                <strong style={{ color: "#f3f4f6" }}>Account No:</strong>{" "}
                {config.payment.accountNumber}
              </p>
              <p
                style={{
                  color: "#d1d5db",
                  margin: "8px 0",
                  fontSize: "0.9rem",
                }}
              >
                <strong style={{ color: "#f3f4f6" }}>Sort Code:</strong>{" "}
                {config.payment.sortCode}
              </p>
              <p
                style={{
                  color: "#d1d5db",
                  margin: "8px 0",
                  fontSize: "0.9rem",
                }}
              >
                <strong style={{ color: "#f3f4f6" }}>Reference:</strong>{" "}
                {config.payment.reference}
              </p>

              {/* Dynamic Instructions - THIS IS WHERE THE MAP CODE GOES */}
              <div style={{ marginTop: "16px" }}>
                {config.payment.instructions.map((instruction, index) => (
                  <p
                    key={index}
                    style={{
                      marginTop: "8px",
                      fontWeight: index === 0 ? "700" : "500",
                      color: index === 0 ? "#f59e0b" : "#d1d5db",
                      fontSize: "0.9rem",
                    }}
                  >
                    {instruction}
                  </p>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#f3f4f6",
                    marginBottom: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Phone Number */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#f3f4f6",
                    marginBottom: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="07XXX XXXXXX"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Email */}
              {/* <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#f3f4f6",
                    marginBottom: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div> */}

              {/* Alert Message */}
              {message.text && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    background:
                      message.type === "success" ? "#064e3b" : "#7f1d1d",
                    color: message.type === "success" ? "#10b981" : "#ef4444",
                    border: `1px solid ${
                      message.type === "success" ? "#10b981" : "#ef4444"
                    }40`,
                    fontSize: "0.9rem",
                  }}
                >
                  {message.text}
                </div>
              )}

              {/* Tickets */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#f3f4f6",
                    marginBottom: "12px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  Number of Tickets *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  {/* Under 5 */}
                  <div
                    style={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        color: "#f3f4f6",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        marginBottom: "8px",
                      }}
                    >
                      Under 5
                    </label>
                    <div
                      style={{
                        color: "#10b981",
                        fontSize: "1.125rem",
                        fontWeight: "700",
                        marginBottom: "8px",
                      }}
                    >
                      FREE
                    </div>
                    <input
                      type="number"
                      name="under5"
                      min="0"
                      value={formData.under5 || ""}
                      placeholder="0"
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f3f4f6",
                        fontSize: "1rem",
                        textAlign: "center",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Age 5-12 */}
                  <div
                    style={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        color: "#f3f4f6",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        marginBottom: "8px",
                      }}
                    >
                      Age 5 - 12
                    </label>
                    <div
                      style={{
                        color: "#667eea",
                        fontSize: "1.125rem",
                        fontWeight: "700",
                        marginBottom: "8px",
                      }}
                    >
                      {config.pricing.symbol}
                      {config.pricing.tiers[1].price}
                    </div>
                    <input
                      type="number"
                      name="age5to12"
                      min="0"
                      value={formData.age5to12 || ""}
                      placeholder="0"
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f3f4f6",
                        fontSize: "1rem",
                        textAlign: "center",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Age 12+ */}
                  <div
                    style={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        color: "#f3f4f6",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        marginBottom: "8px",
                      }}
                    >
                      Age 12+
                    </label>
                    <div
                      style={{
                        color: "#667eea",
                        fontSize: "1.125rem",
                        fontWeight: "700",
                        marginBottom: "8px",
                      }}
                    >
                      {config.pricing.symbol}
                      {config.pricing.tiers[2].price}
                    </div>
                    <input
                      type="number"
                      name="age12plus"
                      min="0"
                      value={formData.age12plus || ""}
                      placeholder="0"
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "6px",
                        color: "#f3f4f6",
                        fontSize: "1rem",
                        textAlign: "center",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              {totalAmount > 0 && (
                <div
                  style={{
                    background: "#111827",
                    border: "2px solid #667eea",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    Total Amount to Pay
                  </div>
                  <div
                    style={{
                      color: "#10b981",
                      fontSize: "2rem",
                      fontWeight: "700",
                    }}
                  >
                    £{totalAmount}
                  </div>
                </div>
              )}

              {/* Payment Reference */}
              {/* <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#f3f4f6",
                    marginBottom: "8px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  Payment Reference (Your Name)
                </label>
                <input
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="Name used in bank transfer"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div> */}

              {/* Additional Notes */}
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
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements or dietary restrictions..."
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                    fontSize: "0.9rem",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Submit Button */}
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
                {loading ? "Submitting..." : "🎫 Submit RSVP"}
              </button>
            </form>

            {/* SUCCESS MODAL - Mobile Optimized */}
            {showSuccessModal && submittedData && (
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
                  alignItems: "flex-start",
                  justifyContent: "center",
                  padding: "12px",
                  paddingTop: "20px",
                  animation: "fadeIn 0.3s ease-out",
                  overflowY: "auto",
                }}
                onClick={() => setShowSuccessModal(false)}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                    borderRadius: "20px",
                    padding: "20px 16px",
                    maxWidth: "600px",
                    width: "100%",
                    border: "2px solid #10b981",
                    boxShadow: "0 20px 60px rgba(16, 185, 129, 0.4)",
                    animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    position: "relative",
                    maxHeight: "calc(100vh - 40px)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      color: "#9ca3af",
                      transition: "all 0.2s",
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.color = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    ×
                  </button>

                  {/* Success Icon - Smaller on Mobile */}
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        margin: "0 auto 12px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.4)",
                        animation: "checkmarkBounce 0.6s ease-out",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "48px",
                          lineHeight: "1",
                          color: "white",
                          animation: "checkmarkRotate 0.5s ease-out",
                        }}
                      >
                        ✓
                      </div>
                    </div>

                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        color: "#10b981",
                        margin: "0 0 8px 0",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Booking Confirmed!
                    </h2>

                    <p
                      style={{
                        fontSize: "1rem",
                        color: "#d1d5db",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Thank you,{" "}
                      <strong style={{ color: "#f3f4f6" }}>
                        {submittedData.name}
                      </strong>
                      !
                    </p>

                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        margin: 0,
                      }}
                    >
                      Your registration has been received
                    </p>
                  </div>

                  {/* Booking Details - Compact */}
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        textAlign: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "0.65rem",
                            color: "#9ca3af",
                            marginBottom: "2px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Guests
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#10b981",
                          }}
                        >
                          {submittedData.totalGuests}
                        </div>
                      </div>

                      {submittedData.totalAmount > 0 && (
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.65rem",
                              color: "#9ca3af",
                              marginBottom: "2px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Amount
                          </div>
                          <div
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: "700",
                              color: "#10b981",
                            }}
                          >
                            £{submittedData.totalAmount}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Instructions - Compact */}
                  {submittedData.totalAmount > 0 && (
                    <div
                      style={{
                        background: "#1f2937",
                        border: "2px solid #f59e0b",
                        borderRadius: "12px",
                        padding: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "#f59e0b",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.25rem",
                            flexShrink: 0,
                          }}
                        >
                          💳
                        </div>
                        <h3
                          style={{
                            fontSize: "1rem",
                            fontWeight: "700",
                            color: "#f59e0b",
                            margin: 0,
                          }}
                        >
                          Complete Payment
                        </h3>
                      </div>

                      <div
                        style={{
                          background: "rgba(0, 0, 0, 0.3)",
                          borderRadius: "8px",
                          padding: "10px",
                          marginBottom: "8px",
                          fontSize: "0.75rem",
                          lineHeight: "1.5",
                        }}
                      >
                        <div style={{ marginBottom: "4px" }}>
                          <strong style={{ color: "#f3f4f6" }}>Bank: </strong>
                          <span style={{ color: "#d1d5db" }}>
                            {config.payment.bankName}
                          </span>
                        </div>

                        <div style={{ marginBottom: "4px" }}>
                          <strong style={{ color: "#f3f4f6" }}>
                            Account:{" "}
                          </strong>
                          <span style={{ color: "#d1d5db" }}>
                            {config.payment.accountName}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px",
                            marginBottom: "4px",
                          }}
                        >
                          <div>
                            <strong
                              style={{ color: "#f3f4f6", display: "block" }}
                            >
                              Account No:
                            </strong>
                            <span
                              style={{
                                color: "#d1d5db",
                                fontFamily: "monospace",
                              }}
                            >
                              {config.payment.accountNumber}
                            </span>
                          </div>
                          <div>
                            <strong
                              style={{ color: "#f3f4f6", display: "block" }}
                            >
                              Sort Code:
                            </strong>
                            <span
                              style={{
                                color: "#d1d5db",
                                fontFamily: "monospace",
                              }}
                            >
                              {config.payment.sortCode}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginBottom: "4px" }}>
                          <strong style={{ color: "#f3f4f6" }}>
                            Reference:{" "}
                          </strong>
                          <span style={{ color: "#d1d5db" }}>
                            {submittedData.name}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <strong style={{ color: "#f3f4f6" }}>Amount: </strong>
                          <span
                            style={{
                              color: "#10b981",
                              fontWeight: "700",
                              fontSize: "1rem",
                            }}
                          >
                            £{submittedData.totalAmount}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "rgba(245, 158, 11, 0.1)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          borderRadius: "8px",
                          padding: "8px",
                          fontSize: "0.75rem",
                          color: "#fbbf24",
                          textAlign: "center",
                        }}
                      >
                        ⏰ Deadline:{" "}
                        {new Date(deadlineInfo.deadline).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Compact */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    {/* WhatsApp Button */}
                    {/* Notify Organizer Button */}
                    <button
                      onClick={() => {
                        const message = encodeURIComponent(
                          `🎫 New Booking\n\n` +
                            `Name: ${submittedData.name}\n` +
                            `Guests: ${submittedData.totalGuests} people\n` +
                            `Amount: £${submittedData.totalAmount}\n\n` +
                            `${config.event.fullName}`,
                        );

                        const isMobile = /iPhone|iPad|iPod|Android/i.test(
                          navigator.userAgent,
                        );

                        // Extract organizer WhatsApp from payment instructions
                        const whatsappNumber =
                          config.payment.instructions[0]
                            .match(/\d{5}\s?\d{6}|\d{12}/)?.[0]
                            .replace(/\s/g, "") || "";

                        const internationalNumber = whatsappNumber.startsWith(
                          "0",
                        )
                          ? "44" + whatsappNumber.slice(1)
                          : whatsappNumber;

                        window.open(
                          isMobile
                            ? `whatsapp://send?phone=${internationalNumber}&text=${message}`
                            : `https://wa.me/${internationalNumber}?text=${message}`,
                          "_blank",
                        );
                      }}
                      style={{
                        padding: "12px 16px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#059669";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#10b981";
                      }}
                    >
                      📱 Notify Organiser
                    </button>

                    {/* Print Button */}
                    <button
                      onClick={() => window.print()}
                      style={{
                        padding: "12px 16px",
                        background: "#374151",
                        color: "#f3f4f6",
                        border: "1px solid #4b5563",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#4b5563";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#374151";
                      }}
                    >
                      🖨️ Print
                    </button>
                  </div>

                  {/* Done Button - Sticky */}
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#1f2937",
                      color: "#f3f4f6",
                      border: "2px solid #10b981",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      position: "sticky",
                      bottom: "0",
                      boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.5)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#10b981";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#1f2937";
                      e.currentTarget.style.color = "#f3f4f6";
                    }}
                  >
                    ✓ Done
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "32px",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "0.875rem",
          }}
        >
          {/* <p style={{ margin: "8px 0" }}>⚠️ This event is for members only</p> */}
          <p style={{ margin: "8px 0" }}>
            <a
              href="/admin/login"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Admin Login
            </a>
          </p>

          <p
            style={{
              margin: "16px 0 0 0",
              paddingTop: "16px",
              borderTop: "1px solid #374151",
            }}
          >
            Designed & Developed by{" "}
            <a
              href="https://elitestack.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              EliteStack.co.uk
            </a>
          </p>
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

          @keyframes scaleIn {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes checkmarkBounce {
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

          @media print {
            body * {
              visibility: hidden;
            }
            [data-print="true"],
            [data-print="true"] * {
              visibility: visible;
            }
          }

          @media (max-width: 480px) {
            [style*="padding: 40px"] {
              padding: 20px 16px !important;
            }
            [style*="fontSize: 2rem"] {
              font-size: 1.5rem !important;
            }
            [style*="width: 120px"][style*="height: 120px"] {
              width: 80px !important;
              height: 80px !important;
            }
            [style*="fontSize: 64px"] {
              font-size: 48px !important;
            }
          }

          /* Hide default scrollbar */
          .attendee-list::-webkit-scrollbar {
            width: 8px;
          }

          .attendee-list::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
          }

          .attendee-list::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 4px;
          }

          .attendee-list::-webkit-scrollbar-thumb:hover {
            background: #5568d3;
          }

          /* Firefox */
          .attendee-list {
            scrollbar-width: thin;
            scrollbar-color: #667eea rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
}
