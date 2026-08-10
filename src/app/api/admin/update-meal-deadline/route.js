export const dynamic = "force-dynamic";
import dbConnect from "../../../../lib/mongodb";
import Rsvp from "../../../../models/Rsvp";

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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { deadline } = await request.json();

    if (!deadline) {
      return Response.json({ error: "Deadline is required" }, { status: 400 });
    }

    const newDeadline = new Date(deadline);

    if (isNaN(newDeadline.getTime())) {
      return Response.json(
        { error: "Invalid deadline format" },
        { status: 400 },
      );
    }

    const result = await Rsvp.updateMany(
      { mealSelectionToken: { $exists: true } },
      { $set: { mealSelectionDeadline: newDeadline } },
    );

    return Response.json({
      success: true,
      message: `Deadline updated successfully`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Update deadline error:", error);
    return Response.json(
      { error: "Failed to update deadline" },
      { status: 500 },
    );
  }
}
