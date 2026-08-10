import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  rsvpDeadline: {
    type: Date,
    default: () => new Date("2026-01-09T22:00:00.000Z"),
  },
  rsvpEnabled: {
    type: Boolean,
    default: true,
  },
  eventDate: {
    type: Date,
    default: () => new Date("2026-01-17T13:00:00.000Z"),
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Settings ||
  mongoose.model("Settings", settingsSchema);
