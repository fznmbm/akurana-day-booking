export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Rsvp from "../../../../models/Rsvp";

// GET - Public, aggregate-only check-in stats. No admin auth required (same
// principle as /api/attendees): volunteers and the public display screen
// aren't logged into /admin, so this must not depend on an admin token.
// Returns counts only — never individual RSVP records.
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const volunteerName = searchParams.get("volunteerName")?.trim() || "";
    const todayStart = searchParams.get("todayStart");
    const todayEnd = searchParams.get("todayEnd");

    const allRsvps = await Rsvp.find(
      {},
      "checkedIn checkInTime checkInBy paymentStatus",
    );

    const checkedInCount = allRsvps.filter((r) => r.checkedIn).length;
    const paidCount = allRsvps.filter(
      (r) => r.paymentStatus === "paid",
    ).length;
    const percentage =
      paidCount > 0 ? Math.round((checkedInCount / paidCount) * 100) : 0;

    let volunteerToday = 0;
    let volunteerTotal = 0;

    if (volunteerName) {
      const nameLower = volunteerName.toLowerCase();
      const start = todayStart ? new Date(todayStart) : null;
      const end = todayEnd ? new Date(todayEnd) : null;

      const byThisVolunteer = allRsvps.filter(
        (r) =>
          r.checkedIn &&
          r.checkInBy &&
          r.checkInBy.trim().toLowerCase() === nameLower,
      );

      volunteerTotal = byThisVolunteer.length;
      volunteerToday =
        start && end
          ? byThisVolunteer.filter((r) => {
              const t = new Date(r.checkInTime);
              return t >= start && t < end;
            }).length
          : volunteerTotal;
    }

    return NextResponse.json({
      success: true,
      event: {
        checkedIn: checkedInCount,
        total: paidCount,
        percentage,
      },
      volunteer: {
        today: volunteerToday,
        total: volunteerTotal,
      },
    });
  } catch (error) {
    console.error("Check-in stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-in stats" },
      { status: 500 },
    );
  }
}