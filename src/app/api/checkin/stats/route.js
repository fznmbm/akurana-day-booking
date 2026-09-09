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
      "name under5 age5to12 age12plus checkedIn checkInTime checkInBy paymentStatus",
    );

    const checkedInCount = allRsvps.filter((r) => r.checkedIn).length;
    const paidCount = allRsvps.filter(
      (r) => r.paymentStatus === "paid",
    ).length;
    const percentage =
      paidCount > 0 ? Math.round((checkedInCount / paidCount) * 100) : 0;

    let volunteerToday = 0;
    let volunteerTotal = 0;
    let volunteerRecent = [];

    if (volunteerName) {
      const nameLower = volunteerName.toLowerCase();
      const start = todayStart ? new Date(todayStart) : null;
      const end = todayEnd ? new Date(todayEnd) : null;

      const byThisVolunteer = allRsvps
        .filter(
          (r) =>
            r.checkedIn &&
            r.checkInBy &&
            r.checkInBy.trim().toLowerCase() === nameLower,
        )
        .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));

      volunteerTotal = byThisVolunteer.length;
      volunteerToday =
        start && end
          ? byThisVolunteer.filter((r) => {
              const t = new Date(r.checkInTime);
              return t >= start && t < end;
            }).length
          : volunteerTotal;

      // Only this volunteer's own check-ins — never anyone else's —
      // so a page refresh can restore what they'd already seen.
      volunteerRecent = byThisVolunteer.slice(0, 10).map((r) => ({
        name: r.name,
        totalGuests: r.under5 + r.age5to12 + r.age12plus,
        checkInTime: r.checkInTime,
      }));
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
        recent: volunteerRecent,
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