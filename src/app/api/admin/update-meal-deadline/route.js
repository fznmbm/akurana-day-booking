export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Rsvp from "../../../../models/Rsvp";
import Settings from "../../../../models/Settings";

function checkAuth(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return token && token.length > 0;
}

export async function POST(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { deadline, organization } = await request.json();

    if (!deadline) {
      return NextResponse.json(
        { error: "Deadline is required" },
        { status: 400 }
      );
    }

    const newDeadline = new Date(deadline + ':00.000Z');

    if (isNaN(newDeadline.getTime())) {
      return NextResponse.json(
        { error: "Invalid deadline format" },
        { status: 400 }
      );
    }

    // STEP 1: Save deadline to Settings so it persists even before bookings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        rsvpDeadline: new Date("2026-09-15T22:00:00.000Z"),
        mealDeadline: newDeadline,
        rsvpEnabled: true,
      });
    } else {
      settings.mealDeadline = newDeadline;
      settings.updatedAt = new Date();
      await settings.save();
    }

    // STEP 2: Also update any existing RSVPs that already have meal tokens
    const filter = { mealSelectionToken: { $exists: true } };
    if (organization && organization !== "all") {
      filter.organization = organization;
    }

    const result = await Rsvp.updateMany(
      filter,
      { $set: { mealSelectionDeadline: newDeadline } }
    );

    return NextResponse.json({
      success: true,
      message: `Meal deadline saved successfully`,
      rsvpsUpdated: result.modifiedCount,
      deadline: newDeadline,
    });

  } catch (error) {
    console.error("Update deadline error:", error);
    return NextResponse.json(
      { error: "Failed to update deadline" },
      { status: 500 }
    );
  }
}

// GET - fetch current meal deadline
export async function GET(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const settings = await Settings.findOne();
    return NextResponse.json({
      success: true,
      mealDeadline: settings?.mealDeadline || new Date("2026-09-12T22:00:00.000Z"),
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch deadline" },
      { status: 500 }
    );
  }
}