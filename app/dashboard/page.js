"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Flame,
  Users,
  Play,
  Calendar,
  ListTodo,
  BarChart3,
  ChevronRight,
  Trophy,
  Target,
  Zap,
  Command,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useTaskStore from "../../lib/store/taskStore";
import useSessionStore from "../../lib/store/sessionStore";
import useFriendStore from "../../lib/store/friendStore";
import AIInsights from "../../components/dashboard/AIInsights";
import { useIsMac } from "../../lib/useIsMac";
import QuickTaskOnboarding from "../../components/dashboard/QuickTaskOnboarding";

/**
 * DashboardPage Component
 *
 * This is the main dashboard page component that displays user statistics,
 * tasks, and focus sessions. It provides a comprehensive overview of the user's
 * productivity and activity.
 *
 * @returns {JSX.Element} The dashboard page component
 */
export default function DashboardPage() {
  /**
   * Session data from NextAuth
   * @type {Object}
   */
  const { data: session } = useSession();

  /**
   * Router instance for navigation
   * @type {Object}
   */
  const router = useRouter();

  /**
   * Task store state and actions
   * @type {Object}
   */
  const { tasks, fetchTasks } = useTaskStore();

  /**
   * Session store state and actions
   * @type {Object}
   */
  const { sessions, fetchSessions } = useSessionStore();

  /**
   * Friend store state and actions
   * @type {Object}
   */
  const { friends, fetchFriends } = useFriendStore();

  /**
   * Component mounted state
   * @type {[boolean, Function]}
   */
  const [mounted, setMounted] = useState(false);

  /**
   * Onboarding modal visibility state
   * @type {[boolean, Function]}
   */
  const [showOnboarding, setShowOnboarding] = useState(false);

  /**
   * Detects if the user is on a Mac OS
   * @type {boolean}
   */
  const isMac = useIsMac();

  /**
   * Effect hook to handle component initialization and data fetching
   */
  useEffect(() => {
    setMounted(true);

    // Check if user has seen the onboarding
    const hasSeenOnboarding = localStorage.getItem(
      "hasSeenQuickTaskOnboarding",
    );
    if (!hasSeenOnboarding) {
      // Show onboarding after a brief delay for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (session?.user?.token) {
      // Fetch tasks with error handling
      fetchTasks({}, session.user.token).catch((error) => {
        console.error("Failed to fetch tasks:", error);
      });

      // Fetch sessions with error handling
      fetchSessions({}, session.user.token).catch((error) => {
        console.error("Failed to fetch sessions:", error);
      });

      // Fetch friends with error handling
      fetchFriends(session.user.token).catch((error) => {
        console.error("Failed to fetch friends:", error);
      });
    }
  }, [session, fetchTasks, fetchSessions, fetchFriends]);

  /**
   * Calculate statistics for the dashboard
   */
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /**
   * Filter tasks completed today
   * @type {Array}
   */
  const completedToday = tasks.filter((task) => {
    const isCompleted = task.status === "completed" || task.completed === true;
    const completedDate = task.completedAt
      ? new Date(task.completedAt)
      : new Date(task.updatedAt);
    completedDate.setHours(0, 0, 0, 0);
    return isCompleted && completedDate.getTime() === today.getTime();
  });

  /**
   * Filter focus sessions from today
   * @type {Array}
   */
  const todaySessions = Array.isArray(sessions)
    ? sessions.filter((s) => {
        const sessionDate = new Date(s.completedAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      })
    : [];

  /**
   * Calculate total focus time for today
   * @type {number}
   */
  const todayFocusTime = todaySessions.reduce(
    (acc, s) => acc + (s.duration || 0),
    0,
  );

  /**
   * Calculate the start of the current week
   * @type {Date}
   */
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  /**
   * Filter focus sessions from the current week
   * @type {Array}
   */
  const weekSessions = Array.isArray(sessions)
    ? sessions.filter((s) => {
        const sessionDate = new Date(s.completedAt);
        return sessionDate >= weekStart;
      })
    : [];

  /**
   * Calculate the user's current streak of focus sessions
   * @returns {number} The number of consecutive days with at least one focus session
   */
  const calculateStreak = () => {
    // Return 0 if there are no sessions
    if (!Array.isArray(sessions) || sessions.length === 0) return 0;

    // Sort sessions by date in descending order
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
    );

    // Create a set of unique days with focus sessions
    const uniqueDays = new Set();
    sortedSessions.forEach((s) => {
      const date = new Date(s.completedAt);
      date.setHours(0, 0, 0, 0);
      uniqueDays.add(date.getTime());
    });

    // Convert set to array and sort in descending order
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

    // Calculate the streak
    let streak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = today.getTime() - i * oneDayMs;
      if (sortedDays[i] === expectedDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  /**
   * Current streak of focus sessions
   * @type {number}
   */
  const streak = calculateStreak();

  /**
   * Number of active tasks
   * @type {number}
   */
  const activeTasks = tasks.filter(
    (t) => t.status !== "completed" && !t.completed,
  ).length;

  /**
   * Format duration in seconds to a human-readable string
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration string
   */
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  /**
   * Get a greeting based on the current time of day
   * @returns {string} Appropriate greeting
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  /**
   * Get upcoming tasks with deadlines
   * @type {Array}
   */
  const upcomingTasks = tasks
    .filter((task) => {
      const isCompleted =
        task.status === "completed" || task.completed === true;
      return !isCompleted && task.deadline;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  /**
   * Get the 3 most recent focus sessions
   * @type {Array}
   */
  const recentSessions = Array.isArray(sessions)
    ? [...sessions]
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 3)
    : [];

  /**
   * Dashboard statistics configuration
   * @type {Array}
   */
  const stats = [
    {
      label: "Focus Today",
      value: formatDuration(todayFocusTime),
      subtext: `${todaySessions.length} sessions`,
      icon: Clock,
      gradient: "from-gray-700 to-gray-900",
    },
    {
      label: "Tasks Done",
      value: completedToday.length,
      subtext: `${activeTasks} active`,
      icon: CheckCircle2,
      gradient: "from-gray-800 to-black",
    },
    {
      label: "Streak",
      value: `${streak}`,
      subtext: streak === 1 ? "day" : "days",
      icon: Flame,
      gradient: "from-gray-600 to-gray-800",
    },
    {
      label: "Friends",
      value: friends.length,
      subtext: "connections",
      icon: Users,
      gradient: "from-black to-gray-700",
    },
  ];

  /**
   * Days of the week for the weekly chart
   * @type {Array}
   */
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /**
   * Data for the weekly chart
   * @type {Array}
   */
  const weekData = weekDays.map((day, index) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + index);
    dayDate.setHours(0, 0, 0, 0);

    const daySessions = Array.isArray(sessions)
      ? sessions.filter((s) => {
          const sessionDate = new Date(s.completedAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === dayDate.getTime();
        })
      : [];

    const dayTime = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    return { day, time: dayTime };
  });

  /**
   * Maximum focus time for the week (used for chart scaling)
   * @type {number}
   */
  const maxWeekTime = Math.max(...weekData.map((d) => d.time), 3600);

  /**
   * Get the appropriate icon for a task priority
   * @param {string} priority - Task priority
   * @returns {JSX.Element} Priority icon
   */
  const getPriorityIcon = (priority) => {
    if (priority === "high" || priority === "urgent_important")
      return <Zap className="w-3 h-3" />;
    if (
      priority === "medium" ||
      priority === "urgent_not_important" ||
      priority === "not_urgent_important"
    )
      return <AlertTriangle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  /**
   * Get the appropriate color for a task priority
   * @param {string} priority - Task priority
   * @returns {string} Priority color class
   */
  const getPriorityColor = (priority) => {
    if (priority === "high" || priority === "urgent_important")
      return "bg-gray-900 text-white";
    if (
      priority === "medium" ||
      priority === "urgent_not_important" ||
      priority === "not_urgent_important"
    )
      return "bg-gray-600 text-white";
    return "bg-gray-300 text-gray-900";
  };

  /**
   * Get the appropriate label for a task priority
   * @param {string} priority - Task priority
   * @returns {string} Priority label
   */
  const getPriorityLabel = (priority) => {
    if (priority === "urgent_important") return "high";
    if (
      priority === "urgent_not_important" ||
      priority === "not_urgent_important"
    )
      return "medium";
    if (priority === "not_urgent_not_important") return "low";
    return priority || "low";
  };

  /**
   * Loading state while the component is mounting
   */
  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <QuickTaskOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <div className="h-screen overflow-hidden bg-gray-50">
        <div className="h-full flex flex-col max-w-[1600px] mx-auto p-4 md:p-6">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
                  {getGreeting()},{" "}
                  {session?.user?.name?.split(" ")[0] || "there"}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Quick Task Shortcut Indicator */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setShowOnboarding(true)}
                  className="hidden md:flex items-center gap-2 scale-110 px-4 py-2 bg-gray-100 rounded-full border border-gray-200 hover:border-gray-300 transition-all group cursor-pointer"
                  title="Click to see tutorial again"
                >
                  <Sparkles className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors" />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-black transition-colors">
                    Quick Task
                  </span>
                  <kbd className="px-2 py-0.5 inline-flex items-center gap-1 text-xs font-semibold bg-white border border-gray-200 rounded-full text-gray-700 group-hover:border-gray-300 transition-colors">
                    {isMac ? (
                      // Mac version
                      <>
                        <Command className="w-3 h-3 text-gray-600 group-hover:text-black transition-colors" />
                        <span>K</span>
                      </>
                    ) : (
                      // Windows/Linux version
                      <span>Ctrl+K</span>
                    )}
                  </kbd>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/dashboard/focus")}
                  className="px-4 md:px-6 py-2.5 md:py-3 scale-90 bg-black text-white rounded-full font-semibold flex items-center gap-2 shadow-lg text-sm md:text-base"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Start Focus</span>
                  <span className="sm:hidden">Focus</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content - Fills remaining height */}
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Left Column - Stats, Chart & Tasks */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Stats Cards Row - Narrower */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0"
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-xl p-3 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-1.5 rounded-full bg-gradient-to-br ${stat.gradient}`}
                        >
                          <Icon
                            className="w-3.5 h-3.5 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                        <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <p className="text-xl font-bold text-black mb-0.5">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {stat.subtext}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Weekly Chart - Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex-[1] flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-black">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-black">This Week</h3>
                  </div>
                  <Link
                    href="/dashboard/analytics"
                    className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    View
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex-1 flex items-end justify-between gap-1.5">
                  {weekData.map((day, index) => {
                    const height = maxWeekTime
                      ? (day.time / maxWeekTime) * 100
                      : 0;
                    const isToday = index === today.getDay();

                    return (
                      <div
                        key={day.day}
                        className="flex-1 flex flex-col items-center gap-1.5"
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 2)}%` }}
                          transition={{
                            delay: 0.3 + index * 0.05,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                          className={`w-full rounded-t-lg ${
                            isToday
                              ? "bg-black"
                              : "bg-gray-200 hover:bg-gray-300"
                          } transition-all cursor-pointer`}
                          title={
                            day.time > 0 ? formatDuration(day.time) : "No data"
                          }
                        />
                        <p
                          className={`text-xs font-medium ${
                            isToday ? "text-black" : "text-gray-500"
                          }`}
                        >
                          {day.day}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Tasks - Scrollable */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 flex-[1.2] flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-black">
                      <ListTodo className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-black">
                      Upcoming Tasks
                    </h3>
                  </div>
                  <Link
                    href="/dashboard/tasks"
                    className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    View
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingTasks.map((task, index) => {
                        const priorityLabel = getPriorityLabel(task.priority);
                        return (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-black truncate">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500">
                                  {task.deadline
                                    ? new Date(
                                        task.deadline,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "No deadline"}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${getPriorityColor(
                                priorityLabel,
                              )}`}
                            >
                              {getPriorityIcon(priorityLabel)}
                              <span className="hidden sm:inline">
                                {priorityLabel}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">
                        All caught up!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Activity & Actions */}
            <div className="w-[400px] flex flex-col gap-4 overflow-hidden flex-shrink-0">
              {/* Recent Activity - Scrollable */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 flex-1 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-black">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-black">
                      Recent Activity
                    </h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {recentSessions.length > 0 ? (
                    <div className="space-y-3">
                      {recentSessions.map((session, index) => {
                        const sessionDate = new Date(session.completedAt);
                        const timeAgo = Math.floor(
                          (new Date() - sessionDate) / 1000 / 60,
                        );

                        return (
                          <motion.div
                            key={session._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className="flex gap-2 p-2 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-black">
                                {formatDuration(session.duration)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {timeAgo < 60
                                  ? `${timeAgo}m ago`
                                  : timeAgo < 1440
                                    ? `${Math.floor(timeAgo / 60)}h ago`
                                    : `${Math.floor(timeAgo / 1440)}d ago`}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <Target className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">
                        No activity yet
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Insight */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-4 flex-shrink-0 border border-gray-200"
              >
                <div className="flex items-start gap-2 mb-3">
                  <div className="p-1.5 rounded-full bg-white/10">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold">Daily Insight</h3>
                </div>
                {streak > 0 ? (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-white" />
                      <p className="text-sm font-semibold">
                        {streak} Day Streak! 🔥
                      </p>
                    </div>
                    <p className="text-xs text-gray-300">
                      Keep up the momentum!
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-sm font-semibold mb-1">
                      Ready to Focus?
                    </p>
                    <p className="text-xs text-gray-500">
                      Start a session to build your streak!
                    </p>
                  </div>
                )}
              </motion.div>

              {/* AI Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-ai-card bg-white rounded-2xl border border-gray-200 flex-1 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-black">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-black">
                      AI Insights
                    </h3>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {session?.user?.token && (
                    <AIInsights token={session.user.token} showHeader={false} />
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex-shrink-0"
              >
                <h3 className="text-sm font-bold text-black mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      label: "New Task",
                      href: "/dashboard/tasks",
                      icon: ListTodo,
                    },
                    {
                      label: "Analytics",
                      href: "/dashboard/analytics",
                      icon: BarChart3,
                    },
                    {
                      label: "Friends",
                      href: "/dashboard/friends",
                      icon: Users,
                    },
                  ].map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link key={action.label} href={action.href}>
                        <button className="w-full px-3 py-2 text-sm font-semibold text-black bg-gray-50 hover:bg-gray-100 rounded-full transition-all flex items-center gap-2 border border-gray-200 hover:border-gray-300">
                          <ActionIcon className="w-4 h-4 text-gray-600" />
                          <span className="flex-1 text-left">
                            {action.label}
                          </span>
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
