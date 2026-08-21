import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const query = session.user.id
      ? { _id: session.user.id }
      : { email: session.user.email.toLowerCase() };

    const user = await User.findOne(query).select("-password");

    if (!user) {
      return NextResponse.json(
        { error: "Hunter not found" },
        { status: 404 }
      );
    }

    // --- CALCULATE SUMMARY STATISTICS ---
    const logs = user.workoutLogs || [];
    const totalWorkouts = logs.length;

    // Monthly EXP: Only logs from current calendar month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyExp = logs
      .filter((log) => {
        const logDate = new Date(log.timestamp || log.date);
        return (
          logDate.getMonth() === currentMonth &&
          logDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, log) => sum + (log.earnedExp || 0), 0);

    return NextResponse.json(
      {
        logs,
        summary: {
          totalWorkouts,
          monthlyExp: Math.round(monthlyExp * 10) / 10,
          streak: user.streak || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/user/logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
