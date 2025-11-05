import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import Friend from "@/lib/models/Friend";
import { verifyToken } from "@/lib/auth";

// GET - Search for users
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        users: [],
        message: "Query must be at least 2 characters",
      });
    }

    // Search users by name or email
    const users = await User.find({
      _id: { $ne: decoded.userId }, // Exclude current user
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select(
        "name email avatar_url profile.level profile.total_focus_hours profile.streak_days",
      )
      .limit(limit)
      .lean();

    // Get friendship status for each user
    const userIds = users.map((user) => user._id);
    const friendships = await Friend.find({
      user_id: decoded.userId,
      friend_id: { $in: userIds },
    }).lean();

    // Create a map of friendship statuses
    const friendshipMap = {};
    friendships.forEach((friendship) => {
      friendshipMap[friendship.friend_id.toString()] = {
        status: friendship.status,
        is_requester: friendship.requester_id.toString() === decoded.userId,
      };
    });

    // Add friendship status to each user
    const usersWithStatus = users.map((user) => ({
      ...user,
      friendship: friendshipMap[user._id.toString()] || null,
    }));

    return NextResponse.json({
      success: true,
      users: usersWithStatus,
    });
  } catch (error) {
    console.error("GET /api/friends/search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search users" },
      { status: 500 },
    );
  }
}
