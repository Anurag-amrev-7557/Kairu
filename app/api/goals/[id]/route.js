import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Goal from "@/lib/models/Goal";
import { authenticate } from "@/lib/auth";

// GET single goal
export async function GET(req, { params }) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    const goal = await Goal.findOne({
      _id: id,
      user_id: auth.userId,
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      goal: goal,
    });
  } catch (error) {
    console.error("Get goal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE goal
export async function PUT(req, { params }) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await req.json();

    const goal = await Goal.findOne({
      _id: id,
      user_id: auth.userId,
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Update fields
    const allowedFields = [
      "title",
      "description",
      "type",
      "target_metric",
      "time_frame",
      "deadline",
      "motivation_note",
      "why",
      "icon",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        goal[field] = body[field];
      }
    });

    await goal.save();

    return NextResponse.json({
      success: true,
      message: "Goal updated successfully",
      goal: goal,
    });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH goal (partial update, mainly for status)
export async function PATCH(req, { params }) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await req.json();

    const goal = await Goal.findOne({
      _id: id,
      user_id: auth.userId,
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Update specific fields
    if (body.status !== undefined) {
      goal.status = body.status;
      if (body.status === "completed") {
        goal.completed_at = new Date();
      }
    }

    if (body.current_progress !== undefined) {
      goal.updateProgress(body.current_progress);
    }

    if (body.add_progress !== undefined) {
      goal.addProgress(body.add_progress);
    }

    await goal.save();

    return NextResponse.json({
      success: true,
      message: "Goal updated successfully",
      goal: goal,
    });
  } catch (error) {
    console.error("Patch goal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE goal
export async function DELETE(req, { params }) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    const goal = await Goal.findOne({
      _id: id,
      user_id: auth.userId,
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await Goal.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
