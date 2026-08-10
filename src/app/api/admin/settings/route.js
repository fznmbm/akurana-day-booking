export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Settings from "../../../../models/Settings";

// Simple auth check (same as rsvps route)
function checkAuth(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  return true;
}

// GET - Fetch current settings
export async function GET(request) {
  try {
    if (!checkAuth(request)) {
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
    if (!checkAuth(request)) {
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
        // Treat as UTC directly - append Z to force UTC interpretation
        settings.rsvpDeadline = new Date(rsvpDeadline + ":00.000Z");
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
