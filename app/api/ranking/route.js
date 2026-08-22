import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getTierBadge } from "@/lib/helpers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Hunter identity required." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);

    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 20 : limitParam));
    const skip = (page - 1) * limit;

    // Base query for ranked active hunters
    const baseFilter = {
      isPending: false,
      emailVerified: true,
      username: { $ne: null },
    };

    // Find authenticated current user
    const currentQuery = session.user.id
      ? { _id: session.user.id }
      : { email: session.user.email.toLowerCase() };
    const currentUser = await User.findOne(currentQuery);

    const total = await User.countDocuments(baseFilter);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch ranked page
    const users = await User.find(baseFilter)
      .select("username profile.displayName level exp streak stats createdAt")
      .sort({ level: -1, exp: -1, streak: -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const rankedUsers = users.map((u, index) => {
      const rank = skip + index + 1;
      const tier = getTierBadge(u.level || 0);
      return {
        rank,
        id: u._id.toString(),
        username: u.username,
        displayName: u.profile?.displayName || u.username,
        level: u.level || 0,
        exp: u.exp || 0,
        streak: u.streak || 0,
        stats: u.stats || {},
        tier,
      };
    });

    // Calculate authenticated user's global rank
    let currentUserRank = null;
    let currentUserSummary = null;

    if (currentUser && currentUser.username) {
      const higherCount = await User.countDocuments({
        isPending: false,
        emailVerified: true,
        username: { $ne: null },
        $or: [
          { level: { $gt: currentUser.level || 0 } },
          { level: currentUser.level || 0, exp: { $gt: currentUser.exp || 0 } },
          {
            level: currentUser.level || 0,
            exp: currentUser.exp || 0,
            streak: { $gt: currentUser.streak || 0 },
          },
          {
            level: currentUser.level || 0,
            exp: currentUser.exp || 0,
            streak: currentUser.streak || 0,
            _id: { $lt: currentUser._id },
          },
        ],
      });

      currentUserRank = higherCount + 1;
      currentUserSummary = {
        id: currentUser._id.toString(),
        username: currentUser.username,
        displayName: currentUser.profile?.displayName || currentUser.username,
        level: currentUser.level || 0,
        exp: currentUser.exp || 0,
        streak: currentUser.streak || 0,
        rank: currentUserRank,
        tier: getTierBadge(currentUser.level || 0),
      };
    }

    return NextResponse.json(
      {
        users: rankedUsers,
        total,
        page,
        totalPages,
        currentUserRank,
        currentUser: currentUserSummary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/ranking error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching global ranking" },
      { status: 500 }
    );
  }
}
