import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Session, User } from "@/lib/models";
import { authenticate } from "@/lib/auth";
import { cache } from "@/lib/db/redis";

// GET all sessions for authenticated user
export async function GET(req) {
  try {
    await connectDB();

    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const category = searchParams.get("category");
    const active = searchParams.get("active");

    // Build query
    const query = { user_id: auth.userId };
    if (category) query.category = category;
    if (active === "true") query.is_active = true;

    // Check cache for recent sessions
    const cacheKey = `recent:sessions:${auth.userId}`;
    const cached = await cache.get(cacheKey);

    if (cached && !category && !active && page === 1) {
      return NextResponse.json({
        success: true,
        sessions: cached,
        from_cache: true,
      });
    }

    // Get sessions
    const sessions = await Session.find(query)
      .sort({ start_time: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    // Cache recent sessions
    if (!category && !active && page === 1) {
      await cache.set(cacheKey, sessions, 1800); // 30 minutes
    }

    return NextResponse.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new session
export async function POST(req) {
  try {
    await connectDB();

    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const data = await req.json();

    // Handle completed Pomodoro-style sessions
    if (data.completedAt) {
      const { type, duration, completedAt, taskId, taskTitle } = data;

      const endTime = new Date(completedAt);
      const startTime = new Date(endTime.getTime() - duration * 1000);

      const newSession = await Session.create({
        user_id: auth.userId,
        title: taskTitle || `${type} Session`,
        category: type === "FOCUS" ? "deep_work" : "break",
        task_id: taskId,
        start_time: startTime,
        end_time: endTime,
        duration: duration,
        is_active: false,
      });

      // Invalidate recent sessions cache
      await cache.del(`recent:sessions:${auth.userId}`);

      return NextResponse.json(
        {
          success: true,
          message: "Session logged",
          session: newSession,
        },
        { status: 201 },
      );
    }

    // Validation
    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 },
      );
    }

    // Check if user already has an active session
    const activeSession = await Session.findOne({
      user_id: auth.userId,
      is_active: true,
    });

    if (activeSession) {
      return NextResponse.json(
        { error: "You already have an active session. Please end it first." },
        { status: 409 },
      );
    }

    // Create session
    const session = await Session.create({
      user_id: auth.userId,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      start_time: new Date(),
      is_active: true,
      planned_duration: data.planned_duration,
      pre_intention: data.pre_intention,
      metrics: {
        mood_start: data.mood_start,
        energy_start: data.energy_start,
        location: data.location,
        ambient_noise_level: data.ambient_noise_level,
      },
    });

    // Cache active session
    await cache.set(
      `session:active:${auth.userId}`,
      {
        session_id: session._id,
        start_time: session.start_time,
        title: session.title,
        category: session.category,
      },
      86400, // 24 hours
    );

    // Invalidate recent sessions cache
    await cache.del(`recent:sessions:${auth.userId}`);

    return NextResponse.json(
      {
        success: true,
        message: "Session started",
        session,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
