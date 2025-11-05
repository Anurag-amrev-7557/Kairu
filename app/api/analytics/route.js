import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb.js";
import Session from "@/lib/models/Session";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "today"; // today, day, week, month, year
    const date = searchParams.get("date")
      ? new Date(searchParams.get("date"))
      : new Date();

    let startDate, endDate;

    switch (view) {
      case "today":
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "day":
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "week":
        startDate = new Date(date);
        startDate.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
        endDate.setHours(23, 59, 59, 999);
        break;

      case "month":
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "year":
        startDate = new Date(date.getFullYear(), 0, 1);
        endDate = new Date(date.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
    }

    // Fetch sessions for the specified period
    const sessions = await Session.find({
      userId: session.user.id,
      startTime: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ startTime: -1 })
      .lean();

    // Calculate statistics
    const focusSessions = sessions.filter((s) => s.type === "focus");
    const totalFocusTime = focusSessions.reduce(
      (acc, s) => acc + (s.duration || 0),
      0,
    );

    // Calculate streak (for all time, not just the period)
    const allSessions = await Session.find({
      userId: session.user.id,
      type: "focus",
    })
      .sort({ startTime: -1 })
      .lean();

    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      const hasSessions = allSessions.some((s) => {
        const sessionDate = new Date(s.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === currentDate.getTime();
      });

      if (hasSessions) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate lifetime stats
    const lifetimeSessions = await Session.find({
      userId: session.user.id,
      type: "focus",
    }).lean();

    const lifetimeFocusTime = lifetimeSessions.reduce(
      (acc, s) => acc + (s.duration || 0),
      0,
    );

    const uniqueDays = new Set(
      lifetimeSessions.map((s) => new Date(s.startTime).toDateString()),
    ).size;

    // Group sessions by hour for timeline
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sessions: sessions.filter((s) => {
        const hour = new Date(s.startTime).getHours();
        return hour === i;
      }),
    }));

    // Group sessions by day for weekly/monthly view
    const dailyData = {};
    sessions.forEach((s) => {
      const dayStr = new Date(s.startTime).toDateString();
      if (!dailyData[dayStr]) {
        dailyData[dayStr] = {
          date: dayStr,
          sessions: [],
          totalTime: 0,
          focusTime: 0,
        };
      }
      dailyData[dayStr].sessions.push(s);
      dailyData[dayStr].totalTime += s.duration || 0;
      if (s.type === "focus") {
        dailyData[dayStr].focusTime += s.duration || 0;
      }
    });

    // Group by task for focus by tag
    const taskData = {};
    focusSessions.forEach((s) => {
      const task = s.taskId || "Uncategorized";
      if (!taskData[task]) {
        taskData[task] = {
          count: 0,
          time: 0,
        };
      }
      taskData[task].count++;
      taskData[task].time += s.duration || 0;
    });

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        stats: {
          totalSessions: sessions.length,
          focusSessions: focusSessions.length,
          totalFocusTime,
          averageSessionTime:
            focusSessions.length > 0
              ? totalFocusTime / focusSessions.length
              : 0,
          currentStreak,
        },
        lifetime: {
          totalSessions: lifetimeSessions.length,
          totalFocusTime: lifetimeFocusTime,
          uniqueDays,
        },
        timeline: hourlyData,
        daily: Object.values(dailyData),
        byTask: taskData,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
