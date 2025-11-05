import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Friend from "@/lib/models/Friend";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";

// GET - Fetch friends list and friend requests
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
    const type = searchParams.get("type") || "all"; // all, pending, accepted, sent

    let query = { user_id: decoded.userId };

    if (type === "pending") {
      // Received friend requests (where user is not the requester)
      query = {
        user_id: decoded.userId,
        status: "pending",
        requester_id: { $ne: decoded.userId },
      };
    } else if (type === "sent") {
      // Sent friend requests
      query = {
        user_id: decoded.userId,
        status: "pending",
        requester_id: decoded.userId,
      };
    } else if (type === "accepted") {
      query = {
        user_id: decoded.userId,
        status: "accepted",
      };
    }

    const friendships = await Friend.find(query)
      .populate("friend_id", "name email avatar_url profile")
      .populate("requester_id", "name email")
      .sort({ created_at: -1 })
      .lean();

    // Format the response
    const formattedFriendships = friendships.map((friendship) => ({
      _id: friendship._id,
      friend: friendship.friend_id || null,
      requester: friendship.requester_id || null,
      status: friendship.status,
      created_at: friendship.created_at,
      accepted_at: friendship.accepted_at,
      is_requester: friendship.requester_id
        ? friendship.requester_id._id.toString() === decoded.userId
        : false,
    }));

    return NextResponse.json({
      success: true,
      friendships: formattedFriendships,
    });
  } catch (error) {
    console.error("GET /api/friends error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch friends" },
      { status: 500 },
    );
  }
}

// POST - Send friend request
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { friend_id } = await request.json();

    if (!friend_id) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 },
      );
    }

    if (friend_id === decoded.userId) {
      return NextResponse.json(
        { error: "You cannot send a friend request to yourself" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check if the friend exists
    const friendUser = await User.findById(friend_id);
    if (!friendUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { user_id: decoded.userId, friend_id: friend_id },
        { user_id: friend_id, friend_id: decoded.userId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === "blocked") {
        return NextResponse.json(
          { error: "Cannot send friend request" },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { error: "Friend request already exists" },
        { status: 400 },
      );
    }

    // Create friendship
    const friendships = await Friend.createFriendship(
      decoded.userId,
      friend_id,
    );

    // Populate friend data
    const populatedFriendship = await Friend.findById(friendships[0]._id)
      .populate("friend_id", "name email avatar_url profile")
      .populate("requester_id", "name email")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Friend request sent successfully",
      friendship: {
        _id: populatedFriendship._id,
        friend: populatedFriendship.friend_id || null,
        requester: populatedFriendship.requester_id || null,
        status: populatedFriendship.status,
        created_at: populatedFriendship.created_at,
        accepted_at: populatedFriendship.accepted_at,
      },
    });
  } catch (error) {
    console.error("POST /api/friends error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send friend request" },
      { status: 500 },
    );
  }
}

// PATCH - Accept or reject friend request
export async function PATCH(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { friend_id, action } = await request.json();

    if (!friend_id || !action) {
      return NextResponse.json(
        { error: "Friend ID and action are required" },
        { status: 400 },
      );
    }

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await dbConnect();

    // Check if friendship exists and user is the recipient
    const friendship = await Friend.findOne({
      user_id: decoded.userId,
      friend_id: friend_id,
      status: "pending",
      requester_id: { $ne: decoded.userId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 },
      );
    }

    if (action === "accept") {
      await Friend.acceptFriendship(decoded.userId, friend_id);

      const updatedFriendship = await Friend.findOne({
        user_id: decoded.userId,
        friend_id: friend_id,
      })
        .populate("friend_id", "name email avatar_url profile")
        .populate("requester_id", "name email")
        .lean();

      return NextResponse.json({
        success: true,
        message: "Friend request accepted",
        friendship: {
          _id: updatedFriendship._id,
          friend: updatedFriendship.friend_id || null,
          requester: updatedFriendship.requester_id || null,
          status: updatedFriendship.status,
          created_at: updatedFriendship.created_at,
          accepted_at: updatedFriendship.accepted_at,
        },
      });
    } else if (action === "reject") {
      await Friend.removeFriendship(decoded.userId, friend_id);

      return NextResponse.json({
        success: true,
        message: "Friend request rejected",
      });
    }
  } catch (error) {
    console.error("PATCH /api/friends error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update friend request" },
      { status: 500 },
    );
  }
}

// DELETE - Remove friend or cancel friend request
export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friend_id = searchParams.get("friend_id");

    if (!friend_id) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    await Friend.removeFriendship(decoded.userId, friend_id);

    return NextResponse.json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/friends error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove friend" },
      { status: 500 },
    );
  }
}
