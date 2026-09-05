import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Fail loudly at build/runtime instead of silently issuing insecure tokens
  console.error(
    "FATAL: JWT_SECRET is not set. Set it in your environment variables.",
  );
}

// Issue a signed admin token. Call this from the login route only.
export function signAdminToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
}

// Verify a request's Authorization header carries a valid, unexpired,
// correctly-signed admin token. Use this in every protected API route.
export function verifyAdminAuth(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET);
    return payload?.role === "admin";
  } catch (error) {
    // Covers expired tokens, bad signatures, malformed tokens, etc.
    return false;
  }
}