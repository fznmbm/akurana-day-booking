export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Rsvp from "../../../models/Rsvp";
import Settings from "../../../models/Settings";
import { getConfig } from "../../../config";
import { uploadReceiptFile } from "../../../lib/storage";

const ALLOWED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];
const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    await dbConnect();
    const config = getConfig();

    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const address = formData.get("address")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const organization = formData.get("organization")?.toString() || "ahhc";
    const notes = formData.get("notes")?.toString().trim() || "";
    const paymentProofReference =
      formData.get("paymentProofReference")?.toString().trim() || "";
    const under5 = parseInt(formData.get("under5")) || 0;
    const age5to12 = parseInt(formData.get("age5to12")) || 0;
    const age12plus = parseInt(formData.get("age12plus")) || 0;
    const receiptFile = formData.get("receipt");

    // Check RSVP deadline before accepting any submission
    const settings = await Settings.findOne();
    if (settings) {
      const now = new Date();
      const deadlinePassed = now > new Date(settings.rsvpDeadline);
      if (deadlinePassed || settings.rsvpEnabled === false) {
        return NextResponse.json(
          {
            error:
              "The RSVP deadline has passed. New bookings are no longer accepted.",
          },
          { status: 403 },
        );
      }
    }

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone number are required" },
        { status: 400 },
      );
    }

    // Check if at least one ticket is selected
    const totalTickets = under5 + age5to12 + age12plus;
    if (totalTickets === 0) {
      return NextResponse.json(
        { error: "Please select at least one ticket" },
        { status: 400 },
      );
    }

    // Require proof of payment: a reference and a receipt file
    if (!paymentProofReference) {
      return NextResponse.json(
        { error: "Please enter your payment reference" },
        { status: 400 },
      );
    }
    if (!receiptFile || typeof receiptFile === "string" || receiptFile.size === 0) {
      return NextResponse.json(
        { error: "Please upload a screenshot or PDF of your payment receipt" },
        { status: 400 },
      );
    }
    if (!ALLOWED_RECEIPT_TYPES.includes(receiptFile.type)) {
      return NextResponse.json(
        { error: "Receipt must be an image (JPG/PNG/WEBP/HEIC) or a PDF" },
        { status: 400 },
      );
    }
    if (receiptFile.size > MAX_RECEIPT_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Receipt file is too large (max 5MB)" },
        { status: 400 },
      );
    }

    // Check for duplicate booking by phone number
    const existingBooking = await Rsvp.findOne({ phone });
    if (existingBooking) {
      return NextResponse.json(
        { error: "A booking already exists with this phone number. Please contact the organiser if you need to make changes." },
        { status: 409 },
      );
    }

    // Get correct config based on organization selected by user
    const orgId = organization || "ahhc";
    let orgConfig;
    if (orgId === "ahhc") {
      const { ahhcConfig } = require("../../../config/organizations/ahhc.config");
      orgConfig = ahhcConfig;
    } else if (orgId === "auf") {
      const { aufConfig } = require("../../../config/organizations/auf.config");
      orgConfig = aufConfig;
    } else if (orgId === "awauk") {
      const { awaukConfig } = require("../../../config/organizations/awauk.config");
      orgConfig = awaukConfig;
    } else {
      orgConfig = config;
    }

    // Calculate total amount from CORRECT org pricing
    const childTier = orgConfig.pricing.tiers.find((t) => t.id === "child");
    const adultTier = orgConfig.pricing.tiers.find((t) => t.id === "adult");
    const totalAmount =
      age5to12 * childTier.price + age12plus * adultTier.price;

    // Generate human-readable booking reference
    const bookingRef = `AKD-${orgId.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Upload the receipt to Backblaze before creating the RSVP, so we never
    // save a booking that claims to have a receipt but doesn't
    const receiptBuffer = Buffer.from(await receiptFile.arrayBuffer());
    const receiptFileKey = await uploadReceiptFile(
      receiptBuffer,
      receiptFile.name,
      receiptFile.type,
    );

    // Create new RSVP with organization field and payment evidence
    const rsvp = await Rsvp.create({
      organization: orgId,
      name,
      phone,
      address,
      email,
      under5,
      age5to12,
      age12plus,
      totalAmount,
      paymentReference: bookingRef,
      paymentProofReference,
      receiptFileKey,
      receiptUploadedAt: new Date(),
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        message: "RSVP submitted successfully!",
        bookingRef,
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
