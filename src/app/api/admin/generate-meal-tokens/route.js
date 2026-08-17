export const dynamic = "force-dynamic";
import dbConnect from "../../../../lib/mongodb"; // 5 levels
import Rsvp from "../../../../models/Rsvp";
import Settings from "../../../../models/Settings";
import { randomBytes } from "crypto";

// Verify admin token (reuse from your existing admin routes)
function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  //return token === process.env.ADMIN_PASSWORD_HASH;
  return token && token.length > 0;
}

// Generate unique token
function generateMealToken() {
  return randomBytes(16).toString("hex"); // 32 character token
}

// GET - Check how many RSVPs need tokens
export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Count paid RSVPs without meal tokens
    const needingTokens = await Rsvp.countDocuments({
      paymentStatus: "paid",
      mealSelectionToken: { $exists: false },
    });

    // Count paid RSVPs with tokens
    const withTokens = await Rsvp.countDocuments({
      paymentStatus: "paid",
      mealSelectionToken: { $exists: true },
    });

    return Response.json({
      needingTokens,
      withTokens,
      total: needingTokens + withTokens,
    });
  } catch (error) {
    console.error("Get token stats error:", error);
    return Response.json({ error: "Failed to get stats" }, { status: 500 });
  }
}

// POST - Generate tokens for all paid RSVPs without tokens
export async function POST(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Find all paid RSVPs without meal tokens
    const rsvpsNeedingTokens = await Rsvp.find({
      paymentStatus: "paid",
      mealSelectionToken: { $exists: false },
    });

    if (rsvpsNeedingTokens.length === 0) {
      return Response.json({
        success: true,
        message: "All paid RSVPs already have meal tokens",
        count: 0,
      });
    }

    // Generate tokens
    let count = 0;
    for (const rsvp of rsvpsNeedingTokens) {
      rsvp.mealSelectionToken = generateMealToken();
      rsvp.mealSelectionComplete = false;
      // Use deadline from Settings if available
      const settings = await Settings.findOne();
      rsvp.mealSelectionDeadline = settings?.mealDeadline || new Date("2026-09-12T22:00:00.000Z");
      await rsvp.save();
      count++;
    }

    return Response.json({
      success: true,
      message: `Generated meal tokens for ${count} RSVPs`,
      count,
    });
  } catch (error) {
    console.error("Generate tokens error:", error);
    return Response.json(
      { error: "Failed to generate tokens" },
      { status: 500 },
    );
  }
}
