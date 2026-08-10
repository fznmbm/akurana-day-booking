export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Rsvp from "../../../models/Rsvp";
import { getConfig } from "../../../config";

export async function POST(request) {
  try {
    await dbConnect();
    const config = getConfig();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and phone number are required" },
        { status: 400 },
      );
    }

    // Check if at least one ticket is selected
    const totalTickets =
      (body.under5 || 0) + (body.age5to12 || 0) + (body.age12plus || 0);
    if (totalTickets === 0) {
      return NextResponse.json(
        { error: "Please select at least one ticket" },
        { status: 400 },
      );
    }

    // Calculate total amount from config pricing
    const childTier = config.pricing.tiers.find((t) => t.id === "child");
    const adultTier = config.pricing.tiers.find((t) => t.id === "adult");
    const totalAmount =
      (body.age5to12 || 0) * childTier.price +
      (body.age12plus || 0) * adultTier.price;

    // Create new RSVP
    const rsvp = await Rsvp.create({
      name: body.name,
      phone: body.phone,
      email: body.email || "",
      under5: body.under5 || 0,
      age5to12: body.age5to12 || 0,
      age12plus: body.age12plus || 0,
      totalAmount: totalAmount,
      paymentReference: body.paymentReference || "",
      notes: body.notes || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "RSVP submitted successfully!",
        data: rsvp,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("RSVP submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (phone) {
      // Get specific RSVP by phone
      const rsvp = await Rsvp.findOne({ phone }).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: rsvp });
    }

    // This endpoint is for public use, so we don't return all RSVPs
    return NextResponse.json(
      { error: "Phone number required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("RSVP fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVP" },
      { status: 500 },
    );
  }
}
