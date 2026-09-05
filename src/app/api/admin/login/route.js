export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminToken } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // TEMPORARY: Hardcoded hash for testing
    // This is the hash for: ISLAH2026@admin
    const adminPasswordHash =
      "$2a$10$aEngRh.DoqLF0CCN6F04UuiyejEyMo8bh9chbraT9SLM4k0Pj4GTq";

    // Compare password with hash
    const isValid = await bcrypt.compare(password, adminPasswordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate a signed, expiring token
    const token = signAdminToken();

    return NextResponse.json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
