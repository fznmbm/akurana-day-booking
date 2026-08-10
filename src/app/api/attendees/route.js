export const dynamic = "force-dynamic";
import dbConnect from "../../../lib/mongodb";
import Rsvp from "../../../models/Rsvp";
import Settings from "../../../models/Settings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // Get settings to check deadline
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        rsvpDeadline: new Date("2026-01-09T22:00:00.000Z"),
        rsvpEnabled: true,
      });
    }

    const now = new Date();
    const deadlinePassed =
      now > new Date(settings.rsvpDeadline) || !settings.rsvpEnabled;

    // Get attendees (only paid ones for public display)
    const attendees = await Rsvp.find({ paymentStatus: "paid" })
      .select("name under5 age5to12 age12plus createdAt")
      .sort({ createdAt: 1 });

    const totalPeople = attendees.reduce(
      (sum, rsvp) => sum + rsvp.under5 + rsvp.age5to12 + rsvp.age12plus,
      0,
    );

    return NextResponse.json({
      deadlinePassed,
      deadline: settings.rsvpDeadline.toISOString(),
      rsvpEnabled: settings.rsvpEnabled,
      attendees: attendees.map((a) => ({
        name: a.name,
        totalGuests: a.under5 + a.age5to12 + a.age12plus,
        registeredDate: a.createdAt,
      })),
      stats: {
        totalFamilies: attendees.length,
        totalPeople,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
