const path = require("path");
const fs = require("fs");

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ ERROR: .env.local file not found!");
  console.error(`   Expected location: ${envPath}`);
  process.exit(1);
}

// Load environment variables
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// MongoDB Connection String from .env.local
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI not found in .env.local file");
  console.error("\n📋 Your .env.local should contain:");
  console.error("   MONGODB_URI=mongodb+srv://...");
  process.exit(1);
}

console.log("✅ Found MONGODB_URI in .env.local");
console.log(`   Connection: ${MONGODB_URI.substring(0, 20)}...`);

// The new deadline: 14th January 2026, 8:00 PM GMT
const NEW_DEADLINE = new Date("2026-01-14T20:00:00.000Z");

async function updateMealDeadline() {
  try {
    console.log("\n🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully\n");

    // Get the rsvps collection
    const db = mongoose.connection.db;
    const rsvpsCollection = db.collection("rsvps");

    // Count RSVPs with meal tokens BEFORE update
    const countBefore = await rsvpsCollection.countDocuments({
      mealSelectionToken: { $exists: true },
    });

    console.log(`📊 Found ${countBefore} RSVPs with meal tokens\n`);

    if (countBefore === 0) {
      console.log("⚠️  No RSVPs with meal tokens found. Nothing to update.");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Show new deadline
    console.log(
      `🗓️  New Deadline: ${NEW_DEADLINE.toLocaleString("en-GB", {
        timeZone: "Europe/London",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })}\n`
    );

    console.log(`⚡ Updating ${countBefore} RSVPs...\n`);

    // Update all RSVPs with meal tokens
    const result = await rsvpsCollection.updateMany(
      { mealSelectionToken: { $exists: true } },
      { $set: { mealSelectionDeadline: NEW_DEADLINE } }
    );

    // Show results
    console.log("════════════════════════════════════════");
    console.log("✅ UPDATE COMPLETE!");
    console.log("════════════════════════════════════════");
    console.log(`📝 Matched: ${result.matchedCount} documents`);
    console.log(`✏️  Modified: ${result.modifiedCount} documents`);
    console.log("════════════════════════════════════════\n");

    // Verify by checking a sample record
    const sample = await rsvpsCollection.findOne({
      mealSelectionToken: { $exists: true },
    });

    if (sample) {
      console.log("🔍 Sample Record Check:");
      console.log(`   Name: ${sample.name}`);
      console.log(
        `   Deadline: ${new Date(sample.mealSelectionDeadline).toLocaleString(
          "en-GB",
          {
            timeZone: "Europe/London",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
          }
        )}\n`
      );
    }

    // Check if any RSVPs have already submitted
    const completedCount = await rsvpsCollection.countDocuments({
      mealSelectionToken: { $exists: true },
      mealSelectionComplete: true,
    });

    const pendingCount = countBefore - completedCount;

    console.log("📊 Current Status:");
    console.log(`   ✅ Completed: ${completedCount} RSVPs`);
    console.log(`   ⏳ Pending: ${pendingCount} RSVPs\n`);

    console.log("✨ All done! Users can now submit until the new deadline.\n");
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Run the script
console.log("\n════════════════════════════════════════");
console.log("🍽️  MEAL DEADLINE UPDATE SCRIPT");
console.log("════════════════════════════════════════\n");

updateMealDeadline();
