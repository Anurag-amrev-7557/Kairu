import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Habit from "@/lib/models/Habit";
import { authenticate } from "@/lib/auth";

// GET all habits for user
export async function GET(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const query = { user_id: auth.userId };
    if (!includeArchived) {
      query.is_archived = false;
    }

    const habits = await Habit.find(query).sort({ createdAt: -1 });

    // Add computed properties
    const habitsWithStats = habits.map((habit) => {
      const habitObj = habit.toObject();
      return {
        ...habitObj,
        completionRate: habit.getCompletionRate(30),
        isDueToday: habit.isDueToday(),
        isCompletedToday: habit.isCompletedOnDate(new Date()),
      };
    });

    return NextResponse.json({
      success: true,
      habits: habitsWithStats,
    });
  } catch (error) {
    console.error("Get habits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE new habit
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
      icon,
      color,
      frequency,
      target_days,
      target_count,
      reminder_enabled,
      reminder_time,
      category,
      difficulty,
    } = body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create new habit
    const habit = new Habit({
      user_id: auth.userId,
      title: title.trim(),
      description: description || "",
      icon: icon || "🎯",
      color: color || "#3B82F6",
      frequency: frequency || "daily",
      target_days: target_days || [0, 1, 2, 3, 4, 5, 6],
      target_count: target_count || 1,
      reminder_enabled: reminder_enabled || false,
      reminder_time: reminder_time || "09:00",
      category: category || "other",
      difficulty: difficulty || "medium",
    });

    await habit.save();

    return NextResponse.json({
      success: true,
      message: "Habit created successfully",
      habit: habit.toObject(),
    });
  } catch (error) {
    console.error("Create habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE habit
export async function PATCH(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { habitId, ...updates } = body;

    if (!habitId) {
      return NextResponse.json(
        { error: "Habit ID is required" },
        { status: 400 }
      );
    }

    const habit = await Habit.findOne({
      _id: habitId,
      user_id: auth.userId,
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Update allowed fields
    const allowedUpdates = [
      "title",
      "description",
      "icon",
      "color",
      "frequency",
      "target_days",
      "target_count",
      "reminder_enabled",
      "reminder_time",
      "category",
      "difficulty",
      "is_archived",
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        habit[field] = updates[field];
      }
    });

    await habit.save();

    return NextResponse.json({
      success: true,
      message: "Habit updated successfully",
      habit: habit.toObject(),
    });
  } catch (error) {
    console.error("Update habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE habit
export async function DELETE(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const habitId = searchParams.get("habitId");

    if (!habitId) {
      return NextResponse.json(
        { error: "Habit ID is required" },
        { status: 400 }
      );
    }

    const habit = await Habit.findOne({
      _id: habitId,
      user_id: auth.userId,
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    await Habit.findByIdAndDelete(habitId);

    return NextResponse.json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    console.error("Delete habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
