export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Rsvp from "../../../models/Rsvp";
import { verifyAdminAuth } from "../../../lib/auth";

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

    // Atomic: this only succeeds if the document is still un-checked-in and
    // paid at the exact moment the database applies it. If two scans of the
    // same code land within the same instant, only one can possibly match.
    const updated = await Rsvp.findOneAndUpdate(
      { checkInCode: code, checkedIn: false, paymentStatus: "paid" },
      {
        $set: {
          checkedIn: true,
          checkInTime: new Date(),
          checkInBy: volunteerName || "Volunteer",
        },
      },
      { new: true },
    );

    if (updated) {
      return NextResponse.json({
        success: true,
        message: `✅ ${updated.name} checked in successfully!`,
        data: {
          name: updated.name,
          totalGuests: updated.under5 + updated.age5to12 + updated.age12plus,
          checkInTime: updated.checkInTime,
          checkInBy: updated.checkInBy,
        },
      });
    }

    // The atomic update didn't match anything — look the record up
    // separately purely to figure out why, for messaging only. No write
    // happens here, so this can't reintroduce the race.
    const rsvp = await Rsvp.findOne({ checkInCode: code });

    if (!rsvp) {
      return NextResponse.json(
        { error: "Invalid check-in code" },
        { status: 404 },
      );
    }

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

    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
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
    if (!verifyAdminAuth(request)) {
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
