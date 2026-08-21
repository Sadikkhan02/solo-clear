import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { token } = params || {};

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, error: "Reset token is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Invalid or expired password reset link. Please request a new recovery link.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: true, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/auth/reset-password/validate/[token] error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error during token validation" },
      { status: 500 }
    );
  }
}
