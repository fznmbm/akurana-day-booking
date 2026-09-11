import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Broadcast that a check-in just happened. Deliberately sends no data —
// the Display page already knows how to fetch and shape everything it
// needs; this just tells it "go fetch right now" instead of waiting for
// its next scheduled poll.
export async function notifyNewCheckIn() {
  try {
    await pusher.trigger("checkins", "new-checkin", {});
  } catch (error) {
    console.error("Pusher notify error:", error);
    // Never let a failed push notification affect the check-in itself,
    // which has already succeeded by the time this runs. The Display
    // page's own polling fallback will still catch it within its
    // fallback interval even if this fails entirely.
  }
}

export default pusher;