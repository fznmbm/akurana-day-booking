export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Settings from "../../../../models/Settings";
import { verifyAdminAuth } from "../../../../lib/auth";

// GET - Fetch current settings
export async function GET(request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        rsvpDeadline: new Date("2026-01-09T22:00:00.000Z"),
        rsvpEnabled: true,
        eventDate: new Date("2026-01-17T13:00:00.000Z"),
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT - Update settings
export async function PUT(request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { rsvpDeadline, rsvpEnabled } = await request.json();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        rsvpDeadline,
        rsvpEnabled,
        updatedAt: new Date(),
      });
    } else {
      if (rsvpDeadline !== undefined) {
        // Client now sends a fully-qualified UTC ISO string
        settings.rsvpDeadline = new Date(rsvpDeadline);
      }
      if (rsvpEnabled !== undefined) settings.rsvpEnabled = rsvpEnabled;
      settings.updatedAt = new Date();
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
