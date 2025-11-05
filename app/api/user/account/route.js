import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Task from "@/lib/models/Task";
import Goal from "@/lib/models/Goal";
import Session from "@/lib/models/Session";
import Habit from "@/lib/models/Habit";
import { authenticate } from "@/lib/auth";

// Export user data
export async function GET(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    // Fetch all user data
    const user = await User.findById(auth.userId).select("-password_hash");
    const tasks = await Task.find({ user_id: auth.userId });
    const goals = await Goal.find({ user_id: auth.userId });
    const sessions = await Session.find({ user_id: auth.userId });
    const habits = await Habit.find({ user_id: auth.userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compile all data
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar_url: user.avatar_url,
        settings: user.settings,
        profile: user.profile,
        subscription: user.subscription,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
      tasks: tasks.map((task) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        tags: task.tags,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      })),
      goals: goals.map((goal) => ({
        id: goal._id,
        title: goal.title,
        description: goal.description,
        target_value: goal.target_value,
        current_value: goal.current_value,
        unit: goal.unit,
        deadline: goal.deadline,
        status: goal.status,
        created_at: goal.createdAt,
        updated_at: goal.updatedAt,
      })),
      sessions: sessions.map((session) => ({
        id: session._id,
        title: session.title,
        duration: session.duration,
        started_at: session.started_at,
        ended_at: session.ended_at,
        type: session.type,
        tags: session.tags,
        created_at: session.createdAt,
      })),
      habits: habits.map((habit) => ({
        id: habit._id,
        title: habit.title,
        description: habit.description,
        icon: habit.icon,
        color: habit.color,
        category: habit.category,
        frequency: habit.frequency,
        target_days: habit.target_days,
        current_streak: habit.current_streak,
        longest_streak: habit.longest_streak,
        total_completions: habit.total_completions,
        completion_history: habit.completion_history,
        created_at: habit.createdAt,
        updated_at: habit.updatedAt,
      })),
      statistics: {
        total_tasks: tasks.length,
        total_goals: goals.length,
        total_sessions: sessions.length,
        total_habits: habits.length,
        total_focus_time: sessions.reduce(
          (acc, session) => acc + (session.duration || 0),
          0
        ),
        total_habit_completions: habits.reduce(
          (acc, habit) => acc + (habit.total_completions || 0),
          0
        ),
      },
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("Export data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete user account
export async function DELETE(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { confirmText } = body;

    // Require confirmation text
    if (confirmText !== "DELETE") {
      return NextResponse.json(
        { error: 'Please type "DELETE" to confirm account deletion' },
        { status: 400 }
      );
    }

    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all related data
    await Task.deleteMany({ user_id: auth.userId });
    await Goal.deleteMany({ user_id: auth.userId });
    await Session.deleteMany({ user_id: auth.userId });
    await Habit.deleteMany({ user_id: auth.userId });

    // Delete the user account
    await User.findByIdAndDelete(auth.userId);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
