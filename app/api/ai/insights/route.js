import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import connectDB from "@/lib/db/mongodb";
import { Session, Task, User, Habit, Goal } from "@/lib/models";
import { generateFocusInsights } from "@/lib/ai/gemini";

export async function GET(req) {
  try {
    await connectDB();

    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10); // Default to last 30 days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch user's sessions from the specified period
    const sessions = await Session.find({
      user_id: session.user.id,
      start_time: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ start_time: -1 })
      .lean();

    // Fetch user's tasks
    const tasks = await Task.find({
      user_id: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user's habits
    const habits = await Habit.find({
      user_id: session.user.id,
    }).lean();

    // Fetch user's goals
    const goals = await Goal.find({
      user_id: session.user.id,
    }).lean();

    // Fetch user's profile and stats
    const user = await User.findById(session.user.id)
      .select("profile stats friends_count")
      .lean();

    // Check if there's enough data
    if (sessions.length < 3) {
      return NextResponse.json({
        success: true,
        insights: [
          {
            type: "info",
            title: "Getting Started",
            description:
              "Complete a few more focus sessions to unlock personalized AI insights about your productivity patterns!",
            suggestion:
              "Try different session types and track your mood and energy levels",
          },
        ],
      });
    }

    // Generate insights using AI
    const result = await generateFocusInsights(
      sessions,
      tasks,
      habits,
      goals,
      user,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      insights: result.insights,
      metadata: {
        sessionsAnalyzed: sessions.length,
        tasksAnalyzed: tasks.length,
        habitsAnalyzed: habits.length,
        goalsAnalyzed: goals.length,
        userLevel: user?.profile?.level || 1,
        periodDays: days,
      },
    });
  } catch (error) {
    console.error("Generate insights error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
