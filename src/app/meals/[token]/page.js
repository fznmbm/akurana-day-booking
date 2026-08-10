"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MealSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [rsvpData, setRsvpData] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Meal selections state
  const [under5Meals, setUnder5Meals] = useState([]);
  const [age5to12Meals, setAge5to12Meals] = useState([]);
  const [age12plusMeals, setAge12plusMeals] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  // Verify token and load data
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/meals/verify/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invalid link");
          setLoading(false);
          return;
        }

        setRsvpData(data.data);

        // Initialize meal selections with existing data or defaults
        const existingSelections = data.data.mealSelections || [];

        // Under 5 selections
        const under5Existing = existingSelections.filter(
          (m) => m.ageCategory === "under5"
        );
        const under5Array = [];
        for (let i = 0; i < data.data.under5; i++) {
          const existing = under5Existing.find((m) => m.personIndex === i + 1);
          under5Array.push(existing?.mealChoice || "nuggets-chips");
        }
        setUnder5Meals(under5Array);

        // Age 5-12 selections
        const age5to12Existing = existingSelections.filter(
          (m) => m.ageCategory === "age5to12"
        );
        const age5to12Array = [];
        for (let i = 0; i < data.data.age5to12; i++) {
          const existing = age5to12Existing.find(
            (m) => m.personIndex === i + 1
          );
          age5to12Array.push(existing?.mealChoice || "rice-curry");
        }
        setAge5to12Meals(age5to12Array);

        // Age 12+ selections
        const age12plusExisting = existingSelections.filter(
          (m) => m.ageCategory === "age12plus"
        );
        const age12plusArray = [];
        for (let i = 0; i < data.data.age12plus; i++) {
          const existing = age12plusExisting.find(
            (m) => m.personIndex === i + 1
          );
          age12plusArray.push(existing?.mealChoice || "rice-curry");
        }
        setAge12plusMeals(age12plusArray);

        // Dietary restrictions
        setDietaryRestrictions(data.data.dietaryRestrictions || "");

        setLoading(false);
      } catch (err) {
        console.error("Verify error:", err);
        setError("Failed to load. Please try again.");
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build meal selections array
    const selections = [];

    // Under 5
    under5Meals.forEach((meal, index) => {
      selections.push({
        ageCategory: "under5",
        personIndex: index + 1,
        mealChoice: meal,
      });
    });

    // Age 5-12
    age5to12Meals.forEach((meal, index) => {
      selections.push({
        ageCategory: "age5to12",
        personIndex: index + 1,
        mealChoice: meal,
      });
    });

    // Age 12+
    age12plusMeals.forEach((meal, index) => {
      selections.push({
        ageCategory: "age12plus",
        personIndex: index + 1,
        mealChoice: meal,
      });
    });

    setSubmitting(true);

    try {
      const response = await fetch("/api/meals/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          mealSelections: selections,
          dietaryRestrictions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏳</div>
            <p style={{ color: "#9ca3af" }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>❌</div>
            <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</h2>
            <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
              Please contact AHHC if you need assistance.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#667eea",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Already submitted state
  if (rsvpData && rsvpData.mealSelectionComplete) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "24px" }}>✅</div>
            <h2
              style={{
                color: "#10b981",
                fontSize: "1.5rem",
                marginBottom: "16px",
              }}
            >
              Already Submitted
            </h2>
            <p style={{ color: "#f3f4f6", marginBottom: "24px" }}>
              Thank you {rsvpData.name}! Your meal selections have already been
              confirmed.
            </p>

            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
                border: "1px solid #374151",
                textAlign: "left",
              }}
            >
              <h3
                style={{
                  color: "#f9fafb",
                  fontSize: "1rem",
                  marginBottom: "16px",
                }}
              >
                📋 Your Selections
              </h3>

              {rsvpData.under5 > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Under 5 ({rsvpData.under5}):
                  </p>
                  {under5Meals.map((meal, i) => (
                    <div
                      key={i}
                      style={{
                        color: "#f3f4f6",
                        fontSize: "0.875rem",
                        marginLeft: "16px",
                      }}
                    >
                      •{" "}
                      {meal === "nuggets-chips"
                        ? "🍗 Nuggets & Chips"
                        : "❌ Not Required"}
                    </div>
                  ))}
                </div>
              )}
              {rsvpData.age5to12 > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Age 5-12 ({rsvpData.age5to12}):
                  </p>
                  {age5to12Meals.map((meal, i) => (
                    <div
                      key={i}
                      style={{ color: "#f3f4f6", fontSize: "0.875rem" }}
                    >
                      •{" "}
                      {meal === "rice-curry"
                        ? "🍛 Rice & Curry"
                        : "🍔 Burger Meal"}
                    </div>
                  ))}
                </div>
              )}

              {rsvpData.age12plus > 0 && (
                <div>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Age 12+ ({rsvpData.age12plus}):
                  </p>
                  {age12plusMeals.map((meal, i) => (
                    <div
                      key={i}
                      style={{ color: "#f3f4f6", fontSize: "0.875rem" }}
                    >
                      •{" "}
                      {meal === "rice-curry"
                        ? "🍛 Rice & Curry"
                        : "🍔 Burger Meal"}
                    </div>
                  ))}
                </div>
              )}

              {dietaryRestrictions && (
                <div>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Dietary Requirements:
                  </p>
                  <p
                    style={{
                      color: "#f3f4f6",
                      fontSize: "0.875rem",
                      marginLeft: "16px",
                    }}
                  >
                    {dietaryRestrictions}
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                border: "1px solid #374151",
              }}
            >
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
                💡 Need to make changes? Please contact AHHC directly.
              </p>
            </div>

            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              See you on 17th January 2026! 🎉
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "24px" }}>✅</div>
            <h2
              style={{
                color: "#10b981",
                fontSize: "1.5rem",
                marginBottom: "16px",
              }}
            >
              Success!
            </h2>
            <p style={{ color: "#f3f4f6", marginBottom: "24px" }}>
              Thank you {rsvpData.name}! Your meal selections have been
              confirmed.
            </p>

            <div
              style={{
                background: "#1f2937",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
                border: "1px solid #374151",
              }}
            >
              <h3
                style={{
                  color: "#f9fafb",
                  fontSize: "1rem",
                  marginBottom: "16px",
                }}
              >
                📋 Your Selections
              </h3>

              {rsvpData.under5 > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Under 5 ({rsvpData.under5}):
                  </p>
                  {under5Meals.map((meal, i) => (
                    <div
                      key={i}
                      style={{ color: "#f3f4f6", fontSize: "0.875rem" }}
                    >
                      •{" "}
                      {meal === "nuggets-chips"
                        ? "🍗 Nuggets & Chips"
                        : "❌ Not Required"}
                    </div>
                  ))}
                </div>
              )}

              {rsvpData.age5to12 > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Age 5-12 ({rsvpData.age5to12}):
                  </p>
                  {age5to12Meals.map((meal, i) => (
                    <div
                      key={i}
                      style={{ color: "#f3f4f6", fontSize: "0.875rem" }}
                    >
                      •{" "}
                      {meal === "rice-curry"
                        ? "🍛 Rice & Curry"
                        : "🍔 Burger Meal"}
                    </div>
                  ))}
                </div>
              )}

              {rsvpData.age12plus > 0 && (
                <div>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Age 12+ ({rsvpData.age12plus}):
                  </p>
                  {age12plusMeals.map((meal, i) => (
                    <div
                      key={i}
                      style={{ color: "#f3f4f6", fontSize: "0.875rem" }}
                    >
                      •{" "}
                      {meal === "rice-curry"
                        ? "🍛 Rice & Curry"
                        : "🍔 Burger Meal"}
                    </div>
                  ))}
                </div>
              )}

              {dietaryRestrictions && (
                <div style={{ marginTop: "16px" }}>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      marginBottom: "8px",
                    }}
                  >
                    Dietary Requirements:
                  </p>
                  <p style={{ color: "#f3f4f6", fontSize: "0.875rem" }}>
                    {dietaryRestrictions}
                  </p>
                </div>
              )}
            </div>

            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              See you on 17th January 2026! 🎉
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🍽️ Meal Selection</h1>
          <p style={styles.subtitle}>AHHC Family Get-Together 2026</p>
        </div>

        {/* Booking Info */}
        <div style={styles.section}>
          <div style={styles.infoCard}>
            <h3 style={styles.sectionTitle}>✅ Your Booking</h3>
            <p style={styles.name}>{rsvpData.name}</p>
            <div style={styles.bookingDetails}>
              <div style={styles.detailRow}>
                <span>Under 5:</span>
                <span>{rsvpData.under5}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Age 5-12:</span>
                <span>{rsvpData.age5to12}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Age 12+:</span>
                <span>{rsvpData.age12plus}</span>
              </div>
              <div style={{ ...styles.detailRow, ...styles.totalRow }}>
                <span>Total People:</span>
                <span>
                  {rsvpData.under5 + rsvpData.age5to12 + rsvpData.age12plus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Under 5 Selections */}
          {/* Under 5 Selections */}
          {rsvpData.under5 > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                👶 Under 5 Children ({rsvpData.under5})
              </h3>
              <p style={styles.sectionDesc}>
                Select meal preference for each child under 5 years
              </p>

              {under5Meals.map((meal, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    background: "#111827",
                    borderRadius: "12px",
                    border: "1px solid #374151",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#f9fafb",
                      marginBottom: "12px",
                      fontSize: "0.95rem",
                    }}
                  >
                    Child {index + 1}:
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px",
                        background:
                          meal === "nuggets-chips" ? "#1e40af" : "#1f2937",
                        border: `2px solid ${
                          meal === "nuggets-chips" ? "#3b82f6" : "#374151"
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name={`under5-${index}`}
                        value="nuggets-chips"
                        checked={meal === "nuggets-chips"}
                        onChange={(e) => {
                          const newMeals = [...under5Meals];
                          newMeals[index] = e.target.value;
                          setUnder5Meals(newMeals);
                        }}
                        style={{
                          marginRight: "12px",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                        required
                      />
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "#f3f4f6",
                        }}
                      >
                        🍗 Nuggets & Chips
                      </span>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px",
                        background:
                          meal === "not-required" ? "#1e40af" : "#1f2937",
                        border: `2px solid ${
                          meal === "not-required" ? "#3b82f6" : "#374151"
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name={`under5-${index}`}
                        value="not-required"
                        checked={meal === "not-required"}
                        onChange={(e) => {
                          const newMeals = [...under5Meals];
                          newMeals[index] = e.target.value;
                          setUnder5Meals(newMeals);
                        }}
                        style={{
                          marginRight: "12px",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "#f3f4f6",
                        }}
                      >
                        ❌ Not Required
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Age 5-12 Selections */}
          {rsvpData.age5to12 > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                🧒 Age 5-12 ({rsvpData.age5to12})
              </h3>
              <p style={styles.sectionDesc}>
                Select meal preference for each person aged 5-12 years
              </p>

              {age5to12Meals.map((meal, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    background: "#111827",
                    borderRadius: "12px",
                    border: "1px solid #374151",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#f9fafb",
                      marginBottom: "12px",
                      fontSize: "0.95rem",
                    }}
                  >
                    Person {index + 1}:
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px",
                        background:
                          meal === "rice-curry" ? "#1e40af" : "#1f2937",
                        border: `2px solid ${
                          meal === "rice-curry" ? "#3b82f6" : "#374151"
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name={`age5to12-${index}`}
                        value="rice-curry"
                        checked={meal === "rice-curry"}
                        onChange={(e) => {
                          const newMeals = [...age5to12Meals];
                          newMeals[index] = e.target.value;
                          setAge5to12Meals(newMeals);
                        }}
                        style={{
                          marginRight: "12px",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                        required
                      />
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "#f3f4f6",
                        }}
                      >
                        🍛 Rice & Curry
                      </span>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px",
                        background:
                          meal === "burger-meal" ? "#1e40af" : "#1f2937",
                        border: `2px solid ${
                          meal === "burger-meal" ? "#3b82f6" : "#374151"
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name={`age5to12-${index}`}
                        value="burger-meal"
                        checked={meal === "burger-meal"}
                        onChange={(e) => {
                          const newMeals = [...age5to12Meals];
                          newMeals[index] = e.target.value;
                          setAge5to12Meals(newMeals);
                        }}
                        style={{
                          marginRight: "12px",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "#f3f4f6",
                        }}
                      >
                        🍔 Burger Meal
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Age 12+ Selections */}
          {rsvpData.age12plus > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                👨‍👩‍👧‍👦 Age 12+ ({rsvpData.age12plus})
              </h3>
              <p style={styles.sectionDesc}>
                Select meal preference for each person aged 12 and above
              </p>

              {age12plusMeals.map((meal, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    background: "#111827",
                    borderRadius: "12px",
                    border: "1px solid #374151",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#f9fafb",
                      marginBottom: "12px",
                      fontSize: "0.95rem",
                    }}
                  >
                    Person {index + 1}:
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px",
                        background:
                          meal === "rice-curry" ? "#1e40af" : "#1f2937",
                        border: `2px solid ${
                          meal === "rice-curry" ? "#3b82f6" : "#374151"
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name={`age12plus-${index}`}
                        value="rice-curry"
                        checked={meal === "rice-curry"}
                        onChange={(e) => {
                          const newMeals = [...age12plusMeals];
                          newMeals[index] = e.target.value;
                          setAge12plusMeals(newMeals);
                        }}
                        style={{
                          marginRight: "12px",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                        required
                      />
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "#f3f4f6",
                        }}
                      >
                        🍛 Rice & Curry
                      </span>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px",
                        background:
                          meal === "burger-meal" ? "#1e40af" : "#1f2937",
                        border: `2px solid ${
                          meal === "burger-meal" ? "#3b82f6" : "#374151"
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name={`age12plus-${index}`}
                        value="burger-meal"
                        checked={meal === "burger-meal"}
                        onChange={(e) => {
                          const newMeals = [...age12plusMeals];
                          newMeals[index] = e.target.value;
                          setAge12plusMeals(newMeals);
                        }}
                        style={{
                          marginRight: "12px",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "500",
                          color: "#f3f4f6",
                        }}
                      >
                        🍔 Burger Meal
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dietary Restrictions */}
          <div style={styles.section}>
            <p style={styles.sectionDesc}>
              ⚠️ Please specify any Allergies & Medical Dietary Requirements we
              should be aware of:
            </p>

            <textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="Example: Severe nut allergy...."
              style={styles.textarea}
              rows="4"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitButton,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "⏳ Submitting..." : "✅ Submit Meal Selections"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "#111827",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    maxWidth: "600px",
    width: "100%",
    background: "#1f2937",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    border: "1px solid #374151",
    marginTop: "20px",
  },
  header: {
    padding: "32px 24px",
    borderBottom: "2px solid #374151",
    textAlign: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    padding: "24px",
    borderBottom: "1px solid #374151",
  },
  infoCard: {
    background: "#111827",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #374151",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: "8px",
  },
  sectionDesc: {
    fontSize: "0.875rem",
    color: "#9ca3af",
    marginBottom: "16px",
  },
  name: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#667eea",
    marginBottom: "16px",
  },
  bookingDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.875rem",
    color: "#d1d5db",
  },
  totalRow: {
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid #374151",
    fontWeight: "600",
    color: "#f3f4f6",
  },
  selectGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#f3f4f6",
    marginBottom: "8px",
  },
  select: {
    width: "100%",
    padding: "12px",
    background: "#111827",
    border: "1px solid #4b5563",
    borderRadius: "8px",
    color: "#f3f4f6",
    fontSize: "0.9rem",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    background: "#111827",
    border: "1px solid #4b5563",
    borderRadius: "8px",
    color: "#f3f4f6",
    fontSize: "0.9rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "0 0 16px 16px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

// Styles - COMPACT VERSION
// const styles = {
//   container: {
//     minHeight: "100vh",
//     background: "#111827",
//     padding: "16px",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "flex-start",
//   },
//   card: {
//     maxWidth: "600px",
//     width: "100%",
//     background: "#1f2937",
//     borderRadius: "16px",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
//     border: "1px solid #374151",
//     marginTop: "16px",
//   },
//   header: {
//     padding: "20px",
//     borderBottom: "2px solid #374151",
//     textAlign: "center",
//     background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//     borderTopLeftRadius: "16px",
//     borderTopRightRadius: "16px",
//   },
//   title: {
//     fontSize: "1.5rem",
//     fontWeight: "700",
//     color: "white",
//     marginBottom: "4px",
//   },
//   subtitle: {
//     fontSize: "0.8rem",
//     color: "rgba(255, 255, 255, 0.8)",
//   },
//   section: {
//     padding: "20px",
//     borderBottom: "1px solid #374151",
//   },
//   infoCard: {
//     background: "#111827",
//     padding: "16px",
//     borderRadius: "12px",
//     border: "1px solid #374151",
//   },
//   sectionTitle: {
//     fontSize: "1rem",
//     fontWeight: "600",
//     color: "#f9fafb",
//     marginBottom: "6px",
//   },
//   sectionDesc: {
//     fontSize: "0.8rem",
//     color: "#9ca3af",
//     marginBottom: "12px",
//   },
//   name: {
//     fontSize: "1.1rem",
//     fontWeight: "600",
//     color: "#667eea",
//     marginBottom: "12px",
//   },
//   bookingDetails: {
//     display: "flex",
//     gap: "8px",
//     flexWrap: "wrap",
//   },
//   detailBadge: {
//     padding: "6px 12px",
//     background: "#374151",
//     borderRadius: "6px",
//     fontSize: "0.8rem",
//     color: "#f3f4f6",
//     fontWeight: "600",
//   },
//   label: {
//     display: "block",
//     fontSize: "0.85rem",
//     fontWeight: "500",
//     color: "#f3f4f6",
//     marginBottom: "6px",
//   },
//   textarea: {
//     width: "100%",
//     padding: "12px",
//     background: "#111827",
//     border: "1px solid #4b5563",
//     borderRadius: "8px",
//     color: "#f3f4f6",
//     fontSize: "0.875rem",
//     outline: "none",
//     resize: "vertical",
//     fontFamily: "inherit",
//   },
//   submitButton: {
//     width: "100%",
//     padding: "16px",
//     background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
//     color: "white",
//     border: "none",
//     borderRadius: "0 0 16px 16px",
//     fontSize: "1rem",
//     fontWeight: "700",
//     cursor: "pointer",
//     transition: "all 0.2s",
//   },
// };
