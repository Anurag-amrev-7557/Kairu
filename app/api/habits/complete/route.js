import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Habit from "@/lib/models/Habit";
import { authenticate } from "@/lib/auth";

// POST - Mark habit as complete/incomplete
export async function POST(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { habitId, date, completed, notes } = body;

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

    const targetDate = date ? new Date(date) : new Date();

    if (completed !== false) {
      // Mark as complete
      habit.markComplete(targetDate, notes || "");
    } else {
      // Mark as incomplete
      habit.markIncomplete(targetDate);
    }

    await habit.save();

    return NextResponse.json({
      success: true,
      message: completed !== false ? "Habit marked as complete" : "Habit marked as incomplete",
      habit: {
        ...habit.toObject(),
        completionRate: habit.getCompletionRate(30),
        isDueToday: habit.isDueToday(),
        isCompletedToday: habit.isCompletedOnDate(new Date()),
      },
    });
  } catch (error) {
    console.error("Complete habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get completion history for a habit
export async function GET(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const habitId = searchParams.get("habitId");
    const days = parseInt(searchParams.get("days") || "30");

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

    // Get completion history for specified days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const filteredHistory = habit.completion_history
      .filter((c) => new Date(c.date) >= startDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({
      success: true,
      history: filteredHistory,
      stats: {
        current_streak: habit.current_streak,
        longest_streak: habit.longest_streak,
        total_completions: habit.total_completions,
        completion_rate: habit.getCompletionRate(days),
      },
    });
  } catch (error) {
    console.error("Get completion history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
