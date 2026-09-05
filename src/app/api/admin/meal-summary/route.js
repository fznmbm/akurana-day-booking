export const dynamic = "force-dynamic";
import dbConnect from "../../../../lib/mongodb"; // 5 levels
import Rsvp from "../../../../models/Rsvp";
import { verifyAdminAuth } from "../../../../lib/auth";

export async function GET(request) {
  if (!verifyAdminAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Get all paid RSVPs with meal tokens
    const paidRsvps = await Rsvp.find({
      paymentStatus: "paid",
      mealSelectionToken: { $exists: true },
    }).sort({ createdAt: 1 });



    // Calculate stats
    const total = paidRsvps.length;
    const completed = paidRsvps.filter((r) => r.mealSelectionComplete).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate meal totals
    // Calculate meal totals
    const mealTotals = {
      under5: {
        "nuggets-chips": 0,
        "not-required": 0,
      },
      age5to12: {
        "rice-curry": 0,
        "burger-meal": 0,
      },
      age12plus: {
        "rice-curry": 0,
        "burger-meal": 0,
      },
    };

    paidRsvps.forEach((rsvp) => {
      if (rsvp.mealSelectionComplete && rsvp.mealSelections) {
        rsvp.mealSelections.forEach((meal) => {
          if (meal.ageCategory === "under5") {
            mealTotals.under5[meal.mealChoice]++;
          } else if (meal.ageCategory === "age5to12") {
            mealTotals.age5to12[meal.mealChoice]++;
          } else if (meal.ageCategory === "age12plus") {
            mealTotals.age12plus[meal.mealChoice]++;
          }
        });
      }
    });

    // Get list of RSVPs with completion status
    const rsvpList = paidRsvps.map((rsvp) => ({
      _id: rsvp._id,
      name: rsvp.name,
      phone: rsvp.phone,
      organization: rsvp.organization || "",
      mealSelectionComplete: rsvp.mealSelectionComplete,
      mealSelectionToken: rsvp.mealSelectionToken,
      mealSelections: rsvp.mealSelections || [],
      dietaryRestrictions: rsvp.dietaryRestrictions || "",
      submittedAt: rsvp.mealSelectionSubmittedAt?.toISOString() || null,
      mealSelectionDeadline: rsvp.mealSelectionDeadline?.toISOString() || null,
      under5: rsvp.under5,
      age5to12: rsvp.age5to12,
      age12plus: rsvp.age12plus,
    }));

    return Response.json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        percentage,
      },
      mealTotals,
      rsvps: rsvpList,
    });
  } catch (error) {
    console.error("Meal summary error:", error);
    return Response.json(
      { error: "Failed to get meal summary" },
      { status: 500 },
    );
  }
}
