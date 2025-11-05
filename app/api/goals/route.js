import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Goal from "@/lib/models/Goal";
import { authenticate } from "@/lib/auth";

// GET all goals for user
export async function GET(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query = { user_id: auth.userId };
    if (status) {
      query.status = status;
    }

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      goals: goals,
    });
  } catch (error) {
    console.error("Get goals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE new goal
export async function POST(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const {
      title,
      description,
      type,
      target_metric,
      time_frame,
      deadline,
      motivation_note,
      why,
      icon,
    } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Goal type is required" },
        { status: 400 }
      );
    }

    // Create new goal
    const goal = new Goal({
      user_id: auth.userId,
      title: title.trim(),
      description: description || "",
      type: type,
      target_metric: target_metric || { value: 0, unit: "units" },
      time_frame: time_frame || "monthly",
      deadline: deadline ? new Date(deadline) : null,
      motivation_note: motivation_note || "",
      why: why || "",
      icon: icon || "target",
      status: "active",
    });

    await goal.save();

    return NextResponse.json(
      {
        success: true,
        message: "Goal created successfully",
        goal: goal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
