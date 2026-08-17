import mongoose from "mongoose";

const RsvpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Please provide your phone number"],
    trim: true,
  },
  address: {
    type: String,
    required: false,
    trim: true,
    default: "",
  },
  organization: {
    type: String,
    enum: ["ahhc", "auf", "awauk"],
    required: [true, "Organization is required"],
    default: "ahhc",
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  under5: {
    type: Number,
    default: 0,
    min: 0,
  },
  age5to12: {
    type: Number,
    default: 0,
    min: 0,
  },
  age12plus: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  paymentReference: {
    type: String,
    trim: true,
  },
  bookingRef: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "confirmed"],
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
  },
  mealSelectionToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  mealSelectionComplete: {
    type: Boolean,
    default: false,
  },
  mealSelectionDeadline: {
    type: Date,
    default: () => new Date("2026-09-21T22:00:00Z"),
  },
  mealSelections: [
    {
      ageCategory: {
        type: String,
        enum: ["under5", "age5to12", "age12plus"],
      },
      personIndex: Number,
      mealChoice: {
        type: String,
        enum: ["nuggets-chips", "not-required", "rice-curry", "burger-meal"],
      },
    },
  ],
  dietaryRestrictions: String,
  mealSelectionSubmittedAt: Date,
  checkInCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkInTime: {
    type: Date,
  },
  checkInBy: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate QR code before saving (totalAmount is calculated by API)
RsvpSchema.pre("save", function (next) {
  // Generate QR code if payment status is paid and code doesn't exist
  if (this.paymentStatus === "paid" && !this.checkInCode) {
    const orgPrefix = (this.organization || "AKD").toUpperCase();
    this.checkInCode = `${orgPrefix}${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;
  }
  next();
});

export default mongoose.models.Rsvp || mongoose.model("Rsvp", RsvpSchema);
