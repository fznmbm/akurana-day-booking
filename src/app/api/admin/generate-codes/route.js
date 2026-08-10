export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Rsvp from "../../../../models/Rsvp";

// Simple auth check
function checkAuth(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  return true;
}

// POST - Generate QR codes for existing paid RSVPs that don't have codes yet
export async function POST(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find all paid RSVPs without check-in codes
    const rsvpsNeedingCodes = await Rsvp.find({
      paymentStatus: "paid",
      $or: [
        { checkInCode: { $exists: false } },
        { checkInCode: null },
        { checkInCode: "" },
      ],
    });

    let updated = 0;

    for (const rsvp of rsvpsNeedingCodes) {
      // Generate unique code
      const checkInCode = `AHHC${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;

      rsvp.checkInCode = checkInCode;
      rsvp.checkedIn = rsvp.checkedIn || false;

      await rsvp.save();
      updated++;

      // Small delay to ensure unique timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return NextResponse.json({
      success: true,
      message: `Generated QR codes for ${updated} existing RSVPs`,
      updated,
    });
  } catch (error) {
    console.error("Generate codes error:", error);
    return NextResponse.json(
      { error: "Failed to generate codes" },
      { status: 500 },
    );
  }
}

// GET - Check how many RSVPs need codes
export async function GET(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const needingCodes = await Rsvp.countDocuments({
      paymentStatus: "paid",
      $or: [
        { checkInCode: { $exists: false } },
        { checkInCode: null },
        { checkInCode: "" },
      ],
    });

    const withCodes = await Rsvp.countDocuments({
      paymentStatus: "paid",
      checkInCode: { $exists: true, $ne: null, $ne: "" },
    });

    return NextResponse.json({
      success: true,
      needingCodes,
      withCodes,
      totalPaid: needingCodes + withCodes,
    });
  } catch (error) {
    console.error("Check codes error:", error);
    return NextResponse.json(
      { error: "Failed to check codes" },
      { status: 500 },
    );
  }
}
