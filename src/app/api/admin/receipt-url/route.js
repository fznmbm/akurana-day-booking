export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Rsvp from "../../../../models/Rsvp";
import { verifyAdminAuth } from "../../../../lib/auth";
import { getReceiptSignedUrl } from "../../../../lib/storage";

// GET - Generate a short-lived signed URL to view a receipt.
// Nothing about a receipt is ever permanently link-accessible; a fresh URL
// is generated on demand, each time, only for authenticated admins.
export async function GET(request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "RSVP ID is required" },
        { status: 400 },
      );
    }

    const rsvp = await Rsvp.findById(id);
    if (!rsvp) {
      return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
    }
    if (!rsvp.receiptFileKey) {
      return NextResponse.json(
        { error: "No receipt uploaded for this booking" },
        { status: 404 },
      );
    }

    const url = await getReceiptSignedUrl(rsvp.receiptFileKey, 300); // 5 minutes

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Receipt URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt link" },
      { status: 500 },
    );
  }
}