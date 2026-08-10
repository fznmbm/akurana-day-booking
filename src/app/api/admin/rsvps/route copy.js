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

export async function GET(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
    }

    const rsvps = await Rsvp.find(query).sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalRsvps: rsvps.length,
      totalUnder5: rsvps.reduce((sum, r) => sum + r.under5, 0),
      totalAge5to12: rsvps.reduce((sum, r) => sum + r.age5to12, 0),
      totalAge12plus: rsvps.reduce((sum, r) => sum + r.age12plus, 0),
      totalAmount: rsvps.reduce((sum, r) => sum + r.totalAmount, 0),
      totalPeople: rsvps.reduce(
        (sum, r) => sum + r.under5 + r.age5to12 + r.age12plus,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: rsvps,
      stats,
    });
  } catch (error) {
    console.error("Fetch RSVPs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}

// export async function PUT(request) {
//   try {
//     if (!checkAuth(request)) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await dbConnect();

//     const body = await request.json();
//     const { id, paymentStatus, notes } = body;

//     if (!id) {
//       return NextResponse.json(
//         { error: "RSVP ID is required" },
//         { status: 400 }
//       );
//     }

//     const updateData = {};
//     if (paymentStatus) updateData.paymentStatus = paymentStatus;
//     if (notes !== undefined) updateData.notes = notes;

//     const rsvp = await Rsvp.findByIdAndUpdate(id, updateData, { new: true });

//     if (!rsvp) {
//       return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: rsvp,
//     });
//   } catch (error) {
//     console.error("Update RSVP error:", error);
//     return NextResponse.json(
//       { error: "Failed to update RSVP" },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, paymentStatus, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "RSVP ID is required" },
        { status: 400 }
      );
    }

    // CHANGED: Find document first
    const rsvp = await Rsvp.findById(id);

    if (!rsvp) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    // CHANGED: Update fields manually
    if (paymentStatus) rsvp.paymentStatus = paymentStatus;
    if (notes !== undefined) rsvp.notes = notes;

    // CHANGED: Save to trigger pre-save hook
    await rsvp.save();

    return NextResponse.json({
      success: true,
      data: rsvp,
    });
  } catch (error) {
    console.error("Update RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "RSVP ID is required" },
        { status: 400 }
      );
    }

    const rsvp = await Rsvp.findByIdAndDelete(id);

    if (!rsvp) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "RSVP deleted successfully",
    });
  } catch (error) {
    console.error("Delete RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to delete RSVP" },
      { status: 500 }
    );
  }
}
