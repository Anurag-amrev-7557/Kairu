import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { authenticate } from "@/lib/auth";

export async function GET(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(auth.userId).select("-password_hash");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
        settings: user.settings,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { name, username, bio, avatar_url } = body;

    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 },
        );
      }
      user.username = username;
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;
    if (bio !== undefined) {
      if (!user.profile) user.profile = {};
      user.profile.bio = bio;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
