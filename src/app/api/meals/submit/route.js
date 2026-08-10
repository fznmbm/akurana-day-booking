export const dynamic = "force-dynamic";
import dbConnect from "../../../../lib/mongodb";
import Rsvp from "../../../../models/Rsvp";

export async function POST(request) {
  try {
    await dbConnect();
    const { token, mealSelections, dietaryRestrictions } = await request.json();

    // Validate token
    if (!token) {
      return Response.json({ error: "Token is required" }, { status: 400 });
    }

    // Find RSVP
    const rsvp = await Rsvp.findOne({ mealSelectionToken: token });

    if (!rsvp) {
      return Response.json({ error: "Invalid link" }, { status: 404 });
    }

    // Check deadline
    const now = new Date();

    // const testDeadline = new Date("2026-01-15T13:55:00.000Z"); // HARDCODED PAST DATE FOR TESTING

    // if (now > testDeadline) {
    //   // USING TEST DEADLINE
    //   return Response.json({ error: "Deadline has passed" }, { status: 410 });
    // }

    if (now > rsvp.mealSelectionDeadline) {
      return Response.json({ error: "Deadline has passed" }, { status: 410 });
    }

    // Validate meal selections
    if (!mealSelections || !Array.isArray(mealSelections)) {
      return Response.json(
        { error: "Invalid meal selections" },
        { status: 400 },
      );
    }

    // Expected counts (UPDATED)
    const expectedUnder5 = rsvp.under5;
    const expectedAge5to12 = rsvp.age5to12;
    const expectedAge12plus = rsvp.age12plus;

    // Filter by new categories (UPDATED)
    const under5Selections = mealSelections.filter(
      (m) => m.ageCategory === "under5",
    );
    const age5to12Selections = mealSelections.filter(
      (m) => m.ageCategory === "age5to12",
    );
    const age12plusSelections = mealSelections.filter(
      (m) => m.ageCategory === "age12plus",
    );

    // Debug logging
    console.log("Expected:", {
      under5: expectedUnder5,
      age5to12: expectedAge5to12,
      age12plus: expectedAge12plus,
    });
    console.log("Received:", {
      under5: under5Selections.length,
      age5to12: age5to12Selections.length,
      age12plus: age12plusSelections.length,
    });

    // Validate counts (UPDATED)
    if (
      under5Selections.length !== expectedUnder5 ||
      age5to12Selections.length !== expectedAge5to12 ||
      age12plusSelections.length !== expectedAge12plus
    ) {
      return Response.json(
        {
          error: "Incomplete meal selections",
          expected: {
            under5: expectedUnder5,
            age5to12: expectedAge5to12,
            age12plus: expectedAge12plus,
          },
          received: {
            under5: under5Selections.length,
            age5to12: age5to12Selections.length,
            age12plus: age12plusSelections.length,
          },
        },
        { status: 400 },
      );
    }

    // Update RSVP
    rsvp.mealSelections = mealSelections;
    rsvp.dietaryRestrictions = dietaryRestrictions || "";
    rsvp.mealSelectionComplete = true;
    rsvp.mealSelectionSubmittedAt = new Date();

    await rsvp.save();

    return Response.json({
      success: true,
      message: "Meal selections saved successfully",
    });
  } catch (error) {
    console.error("Submit meals error:", error);
    return Response.json(
      { error: "Failed to save selections" },
      { status: 500 },
    );
  }
}
