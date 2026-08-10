export const dynamic = "force-dynamic";
import dbConnect from "../../../../../lib/mongodb"; // 6 levels
import Rsvp from "../../../../../models/Rsvp";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { token } = params;

    // Find RSVP by meal token
    const rsvp = await Rsvp.findOne({ mealSelectionToken: token });

    if (!rsvp) {
      return Response.json(
        { error: "Invalid or expired link" },
        { status: 404 },
      );
    }

    // Check if deadline passed
    const now = new Date();

    // const testDeadline = new Date("2026-01-13T13:55:00.000Z"); // FUTURE DATE

    // if (now > testDeadline) {
    //   // USING TEST DEADLINE
    //   return Response.json({ error: "Deadline has passed" }, { status: 410 });
    // }

    if (now > rsvp.mealSelectionDeadline) {
      return Response.json(
        {
          error: "Meal selection deadline has passed",
          deadline: rsvp.mealSelectionDeadline,
        },
        { status: 410 },
      );
    }

    // Return RSVP data (but not sensitive info)
    return Response.json({
      success: true,
      data: {
        name: rsvp.name,
        phone: rsvp.phone,
        under5: rsvp.under5,
        age5to12: rsvp.age5to12,
        age12plus: rsvp.age12plus,
        totalAmount: rsvp.totalAmount,
        mealSelectionComplete: rsvp.mealSelectionComplete,
        mealSelections: rsvp.mealSelections || [],
        dietaryRestrictions: rsvp.dietaryRestrictions || "",
        deadline: rsvp.mealSelectionDeadline,
        submittedAt: rsvp.mealSelectionSubmittedAt,
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return Response.json({ error: "Failed to verify link" }, { status: 500 });
  }
}
