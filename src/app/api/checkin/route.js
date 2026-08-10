export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Rsvp from "../../../models/Rsvp";

// GET - Get RSVP info by check-in code
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    await dbConnect();

    const rsvp = await Rsvp.findOne({ checkInCode: code });

    if (!rsvp) {
      return NextResponse.json(
        { error: "Invalid check-in code" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: rsvp._id,
        name: rsvp.name,
        phone: rsvp.phone,
        totalGuests: rsvp.under5 + rsvp.age5to12 + rsvp.age12plus,
        under5: rsvp.under5,
        age5to12: rsvp.age5to12,
        age12plus: rsvp.age12plus,
        checkedIn: rsvp.checkedIn,
        checkInTime: rsvp.checkInTime,
        checkInBy: rsvp.checkInBy,
        paymentStatus: rsvp.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Get check-in info error:", error);
    return NextResponse.json(
      { error: "Failed to get check-in info" },
      { status: 500 },
    );
  }
}

// POST - Process check-in
export async function POST(request) {
  try {
    const { code, volunteerName } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    await dbConnect();

    const rsvp = await Rsvp.findOne({ checkInCode: code });

    if (!rsvp) {
      return NextResponse.json(
        { error: "Invalid check-in code" },
        { status: 404 },
      );
    }

    // Check if already checked in
    if (rsvp.checkedIn) {
      return NextResponse.json({
        success: false,
        alreadyCheckedIn: true,
        message: `${rsvp.name} already checked in at ${new Date(
          rsvp.checkInTime,
        ).toLocaleString("en-GB")}`,
        data: {
          name: rsvp.name,
          checkInTime: rsvp.checkInTime,
          checkInBy: rsvp.checkInBy,
        },
      });
    }

    // Check if payment is confirmed
    if (rsvp.paymentStatus !== "paid") {
      return NextResponse.json(
        {
          success: false,
          paymentPending: true,
          message: `Payment not confirmed for ${rsvp.name}`,
          data: {
            name: rsvp.name,
            paymentStatus: rsvp.paymentStatus,
          },
        },
        { status: 403 },
      );
    }

    // Process check-in
    rsvp.checkedIn = true;
    rsvp.checkInTime = new Date();
    rsvp.checkInBy = volunteerName || "Volunteer";

    await rsvp.save();

    return NextResponse.json({
      success: true,
      message: `✅ ${rsvp.name} checked in successfully!`,
      data: {
        name: rsvp.name,
        totalGuests: rsvp.under5 + rsvp.age5to12 + rsvp.age12plus,
        checkInTime: rsvp.checkInTime,
        checkInBy: rsvp.checkInBy,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 },
    );
  }
}

// PUT - Undo check-in (admin only, with auth)
export async function PUT(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    await dbConnect();

    const rsvp = await Rsvp.findOne({ checkInCode: code });

    if (!rsvp) {
      return NextResponse.json(
        { error: "Invalid check-in code" },
        { status: 404 },
      );
    }

    // Undo check-in
    rsvp.checkedIn = false;
    rsvp.checkInTime = null;
    rsvp.checkInBy = null;

    await rsvp.save();

    return NextResponse.json({
      success: true,
      message: `Check-in undone for ${rsvp.name}`,
    });
  } catch (error) {
    console.error("Undo check-in error:", error);
    return NextResponse.json(
      { error: "Failed to undo check-in" },
      { status: 500 },
    );
  }
}
