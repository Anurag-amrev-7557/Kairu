import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/db/mongodb.js";
import User from "@/lib/models/User";
import Session from "@/lib/models/Session";
import Task from "@/lib/models/Task";
import Friend from "@/lib/models/Friend";

/**
 * GET /api/leaderboard
 * Fetches leaderboard data with rankings based on different metrics
 * Query params:
 *   - metric: "xp" | "focus_time" | "streak" | "tasks_completed" (default: "xp")
 *   - period: "all_time" | "month" | "week" (default: "all_time")
 *   - scope: "global" | "friends" | "country" (default: "global")
 *   - country: ISO country code (optional, used when scope="country")
 *   - limit: number of users to return (default: 50)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get("metric") || "xp";
    const period = searchParams.get("period") || "all_time";
    const scope = searchParams.get("scope") || "global";
    const countryParam = searchParams.get("country");
    const limit = parseInt(searchParams.get("limit") || "50");

    let startDate;
    const now = new Date();

    // Calculate period start date
    switch (period) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = null; // all_time
    }

    // Get user filter based on scope
    let userFilter = {};
    let friendIds = [];

    if (scope === "friends") {
      // Get user's accepted friends
      const friendships = await Friend.find({
        user_id: session.user.id,
        status: "accepted",
      })
        .select("friend_id")
        .lean();

      friendIds = friendships.map((f) => f.friend_id);

      // Include the user themselves in friends leaderboard
      friendIds.push(session.user.id);

      userFilter = { _id: { $in: friendIds } };
    } else if (scope === "country") {
      const country =
        countryParam ||
        (await User.findById(session.user.id).select("profile.country").lean())
          ?.profile?.country;

      if (country) {
        userFilter = { "profile.country": country };
      }
    }
    // scope === "global" means no filter

    let leaderboardData = [];

    // Fetch data based on metric
    switch (metric) {
      case "xp": {
        // XP leaderboard
        const users = await User.find(userFilter)
          .select(
            "name username email avatar_url profile.level profile.xp profile.country",
          )
          .sort({ "profile.level": -1, "profile.xp": -1 })
          .limit(limit)
          .lean();

        leaderboardData = users.map((user, index) => ({
          rank: index + 1,
          userId: user._id,
          name: user.name || "Anonymous",
          username: user.username || user.email.split("@")[0],
          avatar: user.avatar_url,
          level: user.profile?.level || 1,
          xp: user.profile?.xp || 0,
          totalXP:
            ((user.profile?.level || 1) - 1) * 100 + (user.profile?.xp || 0),
          country: user.profile?.country || "",
          metric: "XP",
          value:
            ((user.profile?.level || 1) - 1) * 100 + (user.profile?.xp || 0),
        }));
        break;
      }

      case "focus_time": {
        // Focus time leaderboard
        const query = {
          type: "focus",
          completed: true,
          ...(startDate && { startTime: { $gte: startDate } }),
        };

        const focusData = await Session.aggregate([
          { $match: query },
          {
            $group: {
              _id: "$userId",
              totalFocusTime: { $sum: "$duration" },
              sessionCount: { $sum: 1 },
            },
          },
          { $sort: { totalFocusTime: -1 } },
          { $limit: limit * 3 }, // Get more to filter by scope
        ]);

        let userIds = focusData.map((d) => d._id);

        // Apply user filter for scope
        const userQuery = {
          _id: { $in: userIds },
          ...userFilter,
        };

        const users = await User.find(userQuery)
          .select(
            "name username email avatar_url profile.level profile.country",
          )
          .lean();

        const userMap = {};
        users.forEach((u) => {
          userMap[u._id.toString()] = u;
        });

        leaderboardData = focusData
          .filter((data) => userMap[data._id.toString()])
          .slice(0, limit)
          .map((data, index) => {
            const user = userMap[data._id.toString()];
            return {
              rank: index + 1,
              userId: data._id,
              name: user?.name || "Anonymous",
              username: user?.username || user?.email?.split("@")[0] || "user",
              avatar: user?.avatar_url,
              level: user?.profile?.level || 1,
              country: user?.profile?.country || "",
              totalFocusTime: data.totalFocusTime,
              sessionCount: data.sessionCount,
              metric: "Focus Time",
              value: data.totalFocusTime,
            };
          });
        break;
      }

      case "streak": {
        // Streak leaderboard
        const users = await User.find(userFilter)
          .select(
            "name username email avatar_url profile.level profile.streak_days profile.best_streak profile.country",
          )
          .sort({ "profile.best_streak": -1, "profile.streak_days": -1 })
          .limit(limit)
          .lean();

        leaderboardData = users.map((user, index) => ({
          rank: index + 1,
          userId: user._id,
          name: user.name || "Anonymous",
          username: user.username || user.email.split("@")[0],
          avatar: user.avatar_url,
          level: user.profile?.level || 1,
          country: user.profile?.country || "",
          currentStreak: user.profile?.streak_days || 0,
          bestStreak: user.profile?.best_streak || 0,
          metric: "Streak",
          value: user.profile?.best_streak || 0,
        }));
        break;
      }

      case "tasks_completed": {
        // Tasks completed leaderboard
        const query = {
          status: "completed",
          ...(startDate && { updatedAt: { $gte: startDate } }),
        };

        const taskData = await Task.aggregate([
          { $match: query },
          {
            $group: {
              _id: "$userId",
              completedTasks: { $sum: 1 },
            },
          },
          { $sort: { completedTasks: -1 } },
          { $limit: limit * 3 },
        ]);

        let userIds = taskData.map((d) => d._id);

        const userQuery = {
          _id: { $in: userIds },
          ...userFilter,
        };

        const users = await User.find(userQuery)
          .select(
            "name username email avatar_url profile.level profile.country",
          )
          .lean();

        const userMap = {};
        users.forEach((u) => {
          userMap[u._id.toString()] = u;
        });

        leaderboardData = taskData
          .filter((data) => userMap[data._id.toString()])
          .slice(0, limit)
          .map((data, index) => {
            const user = userMap[data._id.toString()];
            return {
              rank: index + 1,
              userId: data._id,
              name: user?.name || "Anonymous",
              username: user?.username || user?.email?.split("@")[0] || "user",
              avatar: user?.avatar_url,
              level: user?.profile?.level || 1,
              country: user?.profile?.country || "",
              completedTasks: data.completedTasks,
              metric: "Tasks Completed",
              value: data.completedTasks,
            };
          });
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid metric parameter" },
          { status: 400 },
        );
    }

    // Find current user's position
    const currentUserRank = leaderboardData.findIndex(
      (entry) => entry.userId.toString() === session.user.id,
    );

    // If user not in top limit, fetch their position
    let currentUserData = null;
    if (currentUserRank === -1) {
      // Calculate user's actual rank based on metric
      switch (metric) {
        case "xp": {
          const currentUser = await User.findById(session.user.id)
            .select(
              "name username email avatar_url profile.level profile.xp profile.country",
            )
            .lean();

          if (currentUser) {
            const totalXP =
              ((currentUser.profile?.level || 1) - 1) * 100 +
              (currentUser.profile?.xp || 0);

            const rankQuery = {
              ...userFilter,
              $or: [
                { "profile.level": { $gt: currentUser.profile?.level || 1 } },
                {
                  "profile.level": currentUser.profile?.level || 1,
                  "profile.xp": { $gt: currentUser.profile?.xp || 0 },
                },
              ],
            };

            const rank = await User.countDocuments(rankQuery);

            currentUserData = {
              rank: rank + 1,
              userId: currentUser._id,
              name: currentUser.name || "Anonymous",
              username: currentUser.username || currentUser.email.split("@")[0],
              avatar: currentUser.avatar_url,
              level: currentUser.profile?.level || 1,
              xp: currentUser.profile?.xp || 0,
              totalXP,
              country: currentUser.profile?.country || "",
              metric: "XP",
              value: totalXP,
            };
          }
          break;
        }
        case "focus_time": {
          const query = startDate
            ? {
                userId: session.user.id,
                type: "focus",
                startTime: { $gte: startDate },
                completed: true,
              }
            : { userId: session.user.id, type: "focus", completed: true };

          const userFocusData = await Session.aggregate([
            { $match: query },
            {
              $group: {
                _id: null,
                totalFocusTime: { $sum: "$duration" },
                sessionCount: { $sum: 1 },
              },
            },
          ]);

          if (userFocusData.length > 0) {
            const currentUser = await User.findById(session.user.id)
              .select(
                "name username email avatar_url profile.level profile.country",
              )
              .lean();

            const totalTime = userFocusData[0].totalFocusTime;

            // Count users with better focus time within scope
            const rankQuery = startDate
              ? {
                  type: "focus",
                  startTime: { $gte: startDate },
                  completed: true,
                }
              : { type: "focus", completed: true };

            const betterUsers = await Session.aggregate([
              { $match: rankQuery },
              {
                $group: {
                  _id: "$userId",
                  totalFocusTime: { $sum: "$duration" },
                },
              },
              { $match: { totalFocusTime: { $gt: totalTime } } },
            ]);

            // Filter by scope
            let rank = 0;
            if (scope === "global") {
              rank = betterUsers.length;
            } else {
              const betterUserIds = betterUsers.map((u) => u._id);
              const userQuery = {
                _id: { $in: betterUserIds },
                ...userFilter,
              };
              rank = await User.countDocuments(userQuery);
            }

            currentUserData = {
              rank: rank + 1,
              userId: session.user.id,
              name: currentUser?.name || "Anonymous",
              username:
                currentUser?.username ||
                currentUser?.email?.split("@")[0] ||
                "user",
              avatar: currentUser?.avatar_url,
              level: currentUser?.profile?.level || 1,
              country: currentUser?.profile?.country || "",
              totalFocusTime: totalTime,
              sessionCount: userFocusData[0].sessionCount,
              metric: "Focus Time",
              value: totalTime,
            };
          }
          break;
        }
        case "streak": {
          const currentUser = await User.findById(session.user.id)
            .select(
              "name username email avatar_url profile.level profile.streak_days profile.best_streak profile.country",
            )
            .lean();

          if (currentUser) {
            const rankQuery = {
              ...userFilter,
              $or: [
                {
                  "profile.best_streak": {
                    $gt: currentUser.profile?.best_streak || 0,
                  },
                },
                {
                  "profile.best_streak": currentUser.profile?.best_streak || 0,
                  "profile.streak_days": {
                    $gt: currentUser.profile?.streak_days || 0,
                  },
                },
              ],
            };

            const rank = await User.countDocuments(rankQuery);

            currentUserData = {
              rank: rank + 1,
              userId: currentUser._id,
              name: currentUser.name || "Anonymous",
              username: currentUser.username || currentUser.email.split("@")[0],
              avatar: currentUser.avatar_url,
              level: currentUser.profile?.level || 1,
              country: currentUser.profile?.country || "",
              currentStreak: currentUser.profile?.streak_days || 0,
              bestStreak: currentUser.profile?.best_streak || 0,
              metric: "Streak",
              value: currentUser.profile?.best_streak || 0,
            };
          }
          break;
        }
        case "tasks_completed": {
          const query = startDate
            ? {
                userId: session.user.id,
                status: "completed",
                updatedAt: { $gte: startDate },
              }
            : { userId: session.user.id, status: "completed" };

          const userTaskCount = await Task.countDocuments(query);

          const currentUser = await User.findById(session.user.id)
            .select(
              "name username email avatar_url profile.level profile.country",
            )
            .lean();

          if (currentUser) {
            const rankQuery = startDate
              ? {
                  status: "completed",
                  updatedAt: { $gte: startDate },
                }
              : { status: "completed" };

            const betterUsers = await Task.aggregate([
              { $match: rankQuery },
              {
                $group: {
                  _id: "$userId",
                  completedTasks: { $sum: 1 },
                },
              },
              { $match: { completedTasks: { $gt: userTaskCount } } },
            ]);

            // Filter by scope
            let rank = 0;
            if (scope === "global") {
              rank = betterUsers.length;
            } else {
              const betterUserIds = betterUsers.map((u) => u._id);
              const userQuery = {
                _id: { $in: betterUserIds },
                ...userFilter,
              };
              rank = await User.countDocuments(userQuery);
            }

            currentUserData = {
              rank: rank + 1,
              userId: session.user.id,
              name: currentUser?.name || "Anonymous",
              username:
                currentUser?.username ||
                currentUser?.email?.split("@")[0] ||
                "user",
              avatar: currentUser?.avatar_url,
              level: currentUser?.profile?.level || 1,
              country: currentUser?.profile?.country || "",
              completedTasks: userTaskCount,
              metric: "Tasks Completed",
              value: userTaskCount,
            };
          }
          break;
        }
      }
    } else {
      currentUserData = leaderboardData[currentUserRank];
    }

    // Get list of available countries from users
    const countries = await User.distinct("profile.country");
    const availableCountries = countries.filter((c) => c && c.trim() !== "");

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboardData,
        currentUser: currentUserData,
        metric,
        period,
        scope,
        totalUsers: leaderboardData.length,
        availableCountries: availableCountries.sort(),
      },
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
