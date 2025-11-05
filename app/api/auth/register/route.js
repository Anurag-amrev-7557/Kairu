import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User } from "@/lib/models";
import {
  hashPassword,
  generateToken,
  generateUniqueUsername,
} from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password, name, country } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 },
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Generate unique username
    const baseName = name || email.split("@")[0];
    const username = await generateUniqueUsername(baseName);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password_hash,
      name: name || email.split("@")[0],
      username: username,
      profile: {
        streak_days: 0,
        best_streak: 0,
        level: 1,
        xp: 0,
        total_focus_hours: 0,
        country: country || "",
      },
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          username: user.username,
          profile: user.profile,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
