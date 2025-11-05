"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTaskStore from "../../../lib/store/taskStore";
import { useSession } from "next-auth/react";

import {
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Award,
  Flame,
  Activity,
  Copy,
  Brain,
} from "lucide-react";

const VIEW_TABS = {
  OVERVIEW: "overview",
  DAY: "day",
  WEEK: "week",
  YEAR: "year",
};

export default function AnalyticsPage() {
  const [activeView, setActiveView] = useState(VIEW_TABS.OVERVIEW);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks, fetchTasks } = useTaskStore();
  const { data: session } = useSession();

  // Sample focus sessions data for demonstration
  const generateSampleSessions = () => {
    const today = new Date();
    const sampleSessions = [];

    // Generate sessions for the past week
    for (let i = 0; i < 7; i++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - i);

      // Vary sessions per day based on day of week (more on weekdays)
      const isWeekend =
        sessionDate.getDay() === 0 || sessionDate.getDay() === 6;
      const sessionsPerDay = isWeekend
        ? Math.floor(Math.random() * 2) + 1 // 1-2 sessions on weekends
        : Math.floor(Math.random() * 4) + 2; // 2-5 sessions on weekdays

      // Define realistic work hours with sessions
      const workStartHour = 9; // 9 AM
      const workEndHour = 17; // 5 PM
      const sessionTimes = [];

      // Generate random session start times during work hours
      for (let j = 0; j < sessionsPerDay; j++) {
        const randomHour =
          workStartHour + Math.random() * (workEndHour - workStartHour);
        const sessionStartTime = new Date(sessionDate);
        sessionStartTime.setHours(
          Math.floor(randomHour),
          Math.floor(Math.random() * 60),
          0,
          0,
        );
        sessionTimes.push(sessionStartTime);
      }

      // Sort session times chronologically
      sessionTimes.sort((a, b) => a - b);

      sessionTimes.forEach((sessionTime, j) => {
        // Vary session durations with common Pomodoro patterns
        const durationOptions = [25, 30, 45, 50]; // minutes
        const durationMinutes =
          durationOptions[Math.floor(Math.random() * durationOptions.length)];

        const session = {
          _id: `sample-${i}-${j}`,
          type: "FOCUS",
          duration: durationMinutes * 60, // convert to seconds
          completedAt: sessionTime,
          task_id: `sample-task-${Math.floor(Math.random() * 5) + 1}`,
          title: [
            "Deep Work Session",
            "Code Review",
            "Project Planning",
            "Learning Session",
            "Creative Writing",
            "Bug Fixing",
            "Meeting Prep",
            "Documentation",
          ][Math.floor(Math.random() * 8)],
        };
        sampleSessions.push(session);
      });
    }

    return sampleSessions;
  };

  // Sample tasks data
  const sampleTasks = [
    {
      _id: "sample-task-1",
      title: "Frontend Development",
      tags: ["Development", "React"],
    },
    {
      _id: "sample-task-2",
      title: "API Integration",
      tags: ["Development", "Backend"],
    },
    {
      _id: "sample-task-3",
      title: "UI/UX Design",
      tags: ["Design", "Creative"],
    },
    {
      _id: "sample-task-4",
      title: "Documentation",
      tags: ["Writing", "Documentation"],
    },
    { _id: "sample-task-5", title: "Research", tags: ["Research", "Learning"] },
  ];

  // Load sessions from localStorage and fetch tasks
  useEffect(() => {
    const savedSessions = localStorage.getItem("focusSessions");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
    }

    // Fetch tasks if session is available
    if (session?.user?.token) {
      fetchTasks({}, session.user.token).catch(console.error);
    }
  }, [session, fetchTasks]);

  return (
    <div className="max-h-screen bg-white p-6">
      <div className="max-w-[90rem] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Analytics</h1>
            <p className="text-gray-500 text-sm">
              Track your focus, analyze patterns, and improve your productivity
            </p>
          </div>
          {/* View Tabs */}
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-full p-1">
              {[
                { id: VIEW_TABS.OVERVIEW, label: "Overview", icon: BarChart3 },
                { id: VIEW_TABS.DAY, label: "Day", icon: Calendar },
                { id: VIEW_TABS.WEEK, label: "Week", icon: TrendingUp },
                { id: VIEW_TABS.YEAR, label: "Year", icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4.5 py-2.5 rounded-full transition-colors ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="viewBackground"
                        className="absolute inset-0 bg-black/90 rounded-full"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                    <div className="flex items-center gap-2 relative z-10">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* View Content */}
        <AnimatePresence mode="wait">
          {activeView === VIEW_TABS.OVERVIEW && (
            <OverviewView
              sessions={sessions}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              tasks={tasks.length > 0 ? tasks : sampleTasks}
            />
          )}
          {activeView === VIEW_TABS.DAY && (
            <DayView
              key="day"
              sessions={sessions}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              tasks={tasks.length > 0 ? tasks : sampleTasks}
            />
          )}
          {activeView === VIEW_TABS.WEEK && (
            <WeekView key="week" sessions={sessions} />
          )}
          {activeView === VIEW_TABS.YEAR && (
            <YearView
              key="year"
              sessions={sessions}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              tasks={tasks.length > 0 ? tasks : sampleTasks}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Overview View with Masonry Layout
function OverviewView({ sessions, currentDate, setCurrentDate, tasks }) {
  const today = new Date();
  const todaySessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate.toDateString() === today.toDateString();
  });

  const focusSessions = todaySessions.filter((s) => s.type === "FOCUS");
  const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      const hasSessions = sessions.some((session) => {
        const sessionDate = new Date(session.completedAt);
        sessionDate.setHours(0, 0, 0, 0);
        return (
          sessionDate.getTime() === currentDate.getTime() &&
          session.type === "FOCUS"
        );
      });

      if (hasSessions) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  // Get lifetime stats
  const lifetimeFocusSessions = sessions.filter((s) => s.type === "FOCUS");
  const lifetimeFocusTime = lifetimeFocusSessions.reduce(
    (acc, s) => acc + s.duration,
    0,
  );
  const uniqueDays = new Set(
    lifetimeFocusSessions.map((s) => new Date(s.completedAt).toDateString()),
  ).size;

  // Get weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate >= weekAgo && session.type === "FOCUS";
  });
  const weekFocusTime = weekSessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-6 max-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="h-full p-2 md:p-0"
      >
        {/* Empty State */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Focus Sessions Yet
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              Start tracking your focus sessions from the Focus tab to see
              detailed analytics and insights about your productivity.
            </p>
            <a
              href="/dashboard/focus"
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Start Focus Session
            </a>
          </div>
        ) : (
          <>
            {/* CSS Grid Layout - Three Column Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full max-h-screen overflow-hidden">
              {/* LEFT COLUMN */}
              <div className="flex flex-col space-y-4 max-h-screen">
                {/* Today's Focus Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow h-fit flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <Clock className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-black">
                          Today's Focus
                        </h3>
                        <p className="text-xs text-gray-500">
                          {today.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Focus Time
                          </span>
                          <span className="text-xl font-bold text-black">
                            {formatDuration(totalFocusTime)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min((totalFocusTime / (8 * 25 * 60)) * 100, 100)}%`,
                            }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-black rounded-full"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Goal: 8 sessions
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <div className="flex items-center gap-1">
                            <Copy className="w-3 h-3" strokeWidth={1.5} />
                            <p className="text-xs text-gray-600">Sessions</p>
                          </div>
                          <p className="text-lg font-bold text-black">
                            {focusSessions.length}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" strokeWidth={1.5} />
                            <p className="text-xs text-gray-600">
                              Avg Duration
                            </p>
                          </div>
                          <p className="text-lg font-bold text-black">
                            {focusSessions.length > 0
                              ? formatDuration(
                                  totalFocusTime / focusSessions.length,
                                )
                              : "0m"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Focus Streak Card - Expanded */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1"
                >
                  <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center">
                        <Flame className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">
                          Focus Streak
                        </h3>
                        <p className="text-xs opacity-90">Daily streak</p>
                      </div>
                    </div>

                    <div className="text-center py-2 flex-1 flex flex-col justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.4 }}
                        className="text-6xl font-semibold mb-10 opactiy-90  "
                      >
                        {streak}
                      </motion.div>
                      <p className="text-sm opacity-90">days in a row</p>
                    </div>

                    <div className="flex items-center justify-center gap-1 pt-2 border-t border-white/20">
                      <Zap className="w-3 h-3" strokeWidth={1.5} />
                      <p className="text-xs">
                        {streak > 0 ? "Keep it up!" : "Start today!"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* This Week Card - At Bottom */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-black">
                          This Week
                        </h3>
                        <p className="text-xs text-gray-500">Last 7 days</p>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Weekly Focus</p>
                        <p className="text-xl font-bold text-black">
                          {formatDuration(weekFocusTime)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <Copy className="w-3 h-3"></Copy>
                            Sessions
                          </p>
                          <p className="text-lg font-bold text-black">
                            {weekSessions.length}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            Daily Avg
                          </p>
                          <p className="text-lg font-bold text-black">
                            {formatDuration(weekFocusTime / 7)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* MIDDLE COLUMN */}
              <div className="flex flex-col space-y-4 h-full">
                {/* Focus by Task Card - Expanded */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1"
                >
                  <div className="h-full">
                    <FocusByTaskCard sessions={focusSessions} tasks={tasks} />
                  </div>
                </motion.div>

                {/* Lifetime Stats Card - At Bottom */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center">
                        <Award className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">
                          Lifetime Stats
                        </h3>
                        <p className="text-xs opacity-75">
                          All-time achievements
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Total Focus Time
                        </p>
                        <p className="text-xl font-bold text-black">
                          {formatDuration(lifetimeFocusTime)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <Copy className="w-3 h-3" strokeWidth={1.5} />
                            Sessions
                          </p>
                          <p className="text-lg font-bold text-black">
                            {lifetimeFocusSessions.length}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" strokeWidth={1.5} />
                            Focus Days
                          </p>
                          <p className="text-lg font-bold text-black">
                            {uniqueDays}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* Calendar Heatmap Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <CalendarHeatmapCard
                    sessions={sessions}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                  />
                </motion.div>

                {/* Quick Stats Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <Brain className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-black">
                          Quick Insights
                        </h3>
                        <p className="text-xs text-gray-500">Key metrics</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 h-fit">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" strokeWidth={1.5} />
                          <p className="text-xs text-gray-600">
                            Total Sessions
                          </p>
                        </div>
                        <p className="text-lg font-bold mt-1">
                          {sessions.length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" strokeWidth={1.5} />
                          <p className="text-xs text-gray-600">This Month</p>
                        </div>
                        <p className="text-lg font-bold text-black mt-1">
                          {
                            sessions.filter((s) => {
                              const sessionDate = new Date(s.completedAt);
                              return (
                                sessionDate.getMonth() === today.getMonth() &&
                                sessionDate.getFullYear() ===
                                  today.getFullYear()
                              );
                            }).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// Calendar Heatmap Card Component
function CalendarHeatmapCard({ sessions, currentDate, setCurrentDate }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = generateCalendarDays(currentDate, sessions);

  // Calculate month stats
  const monthSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return (
      sessionDate.getMonth() === month &&
      sessionDate.getFullYear() === year &&
      session.type === "FOCUS"
    );
  });

  const monthFocusTime = monthSessions.reduce((acc, s) => acc + s.duration, 0);
  const uniqueDays = new Set(
    monthSessions.map((s) => new Date(s.completedAt).toDateString()),
  ).size;

  return (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-all duration-300 hover:border-gray-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-black">
              Focus Calendar
            </h3>
            <p className="text-xs text-gray-500">
              {uniqueDays} active days this month
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Focus</p>
          <p className="text-sm font-bold text-black">
            {formatDuration(monthFocusTime)}
          </p>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
        >
          <ChevronLeft
            className="w-4 h-4 text-gray-600 group-hover:text-black"
            strokeWidth={2}
          />
        </button>
        <div className="text-center">
          <h4 className="text-sm font-bold text-black">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h4>
          <p className="text-xs text-gray-500">
            {monthSessions.length} sessions
          </p>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm group"
        >
          <ChevronRight
            className="w-4 h-4 text-gray-600 group-hover:text-black"
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-semibold text-gray-600 py-1"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <CalendarDay key={index} day={day} />
          ))}
        </div>

        {/* Calendar Legend */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-200 rounded-sm"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-sm"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
            <div className="w-2 h-2 bg-black rounded-sm"></div>
          </div>
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
            <p className="text-xs text-gray-600">Active Days</p>
          </div>
          <p className="text-lg font-bold text-black">{uniqueDays}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
            <p className="text-xs text-gray-600">Sessions</p>
          </div>
          <p className="text-lg font-bold text-black">{monthSessions.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-gray-600" strokeWidth={1.5} />
            <p className="text-xs text-gray-600">Avg/Day</p>
          </div>
          <p className="text-lg font-bold text-black">
            {uniqueDays > 0
              ? formatDuration(monthFocusTime / uniqueDays)
              : "0m"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Calendar Day Component
const CalendarDay = ({ day }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!day.number) {
    return <div className="aspect-square" />;
  }

  const getIntensityStyle = (intensity) => {
    if (intensity === 0)
      return "bg-gray-100 hover:bg-gray-200 text-gray-400 border border-gray-200";
    if (intensity === 1)
      return "bg-gray-200 hover:bg-gray-300 text-black border border-gray-300";
    if (intensity === 2)
      return "bg-gray-400 hover:bg-gray-500 text-white border border-gray-500";
    return "bg-black hover:bg-gray-800 text-white border border-black";
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`aspect-square rounded-full ${getIntensityStyle(day.intensity)}
        transition-all duration-300 relative flex items-center justify-center font-medium text-xs hover:scale-105 hover:shadow-md`}
    >
      <span className="relative z-10">{day.number}</span>
      {day.focusTime && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-lg whitespace-nowrap z-20 shadow-xl font-medium"
        >
          <div className="text-center">
            <div className="font-semibold">{day.focusTime}</div>
            {day.sessions && (
              <div className="text-xs opacity-75">
                {day.sessions} session{day.sessions !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black" />
        </motion.div>
      )}
    </motion.button>
  );
};

// Focus by Task Card Component
function FocusByTaskCard({ sessions, tasks = [] }) {
  // Create a map of task_id to task title for quick lookup
  const taskMap = tasks.reduce((acc, task) => {
    acc[task._id] = task.title;
    return acc;
  }, {});

  // Group sessions by task
  const taskSessions = sessions.reduce((acc, session) => {
    // Get task title from task_id reference or fallback to session title
    const taskTitle = session.task_id
      ? taskMap[session.task_id] || "Unknown Task"
      : session.title || "Uncategorized";

    if (!acc[taskTitle]) {
      acc[taskTitle] = { count: 0, time: 0 };
    }
    acc[taskTitle].count++;
    acc[taskTitle].time += session.duration || 0;
    return acc;
  }, {});

  const sortedTasks = Object.entries(taskSessions)
    .sort(([, a], [, b]) => b.time - a.time)
    .slice(0, 8);

  const maxTime = sortedTasks.length > 0 ? sortedTasks[0][1].time : 1;
  const totalTime = Object.values(taskSessions).reduce(
    (acc, task) => acc + task.time,
    0,
  );

  const getTaskIntensity = (index) => {
    const intensities = [
      "bg-black",
      "bg-gray-800",
      "bg-gray-700",
      "bg-gray-600",
      "bg-gray-500",
      "bg-gray-400",
      "bg-gray-300",
      "bg-gray-200",
    ];
    return intensities[index] || "bg-gray-400";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-all duration-300 hover:border-gray-300 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
            <Target className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-black">
              Focus by Task
            </h3>
            <p className="text-xs text-gray-500">
              {sessions.length > 0
                ? `Top ${sortedTasks.length} tasks today`
                : `Recent ${sortedTasks.length} tasks`}
            </p>
          </div>
        </div>
        {totalTime > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-bold text-black">
              {formatDuration(totalTime)}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {sortedTasks.length > 0 ? (
          <div className="space-y-3 max-h-full overflow-y-auto pr-1 custom-scrollbar">
            {sortedTasks.map(([task, data], index) => (
              <motion.div
                key={task}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full ${getTaskIntensity(index)} flex-shrink-0`}
                    ></div>
                    <span
                      className="text-sm font-medium text-gray-700 truncate flex-1"
                      title={task}
                    >
                      {task}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-xs text-gray-500">
                      {data.count} session{data.count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-bold text-black min-w-[3rem] text-right">
                      {formatDuration(data.time)}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.time / maxTime) * 100}%` }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${getTaskIntensity(index)}`}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {((data.time / totalTime) * 100).toFixed(0)}% of total
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(data.time / data.count / 60)}min avg
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                <Target className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">
                No tasks tracked yet
              </p>
              <p className="text-xs text-gray-400">
                Start a focus session to see your task breakdown
              </p>
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
                {sessions.length > 0 && (
                  <div className="mt-1">
                    Sample session:{" "}
                    {JSON.stringify({
                      title: sessions[0]?.title,
                      task_id: sessions[0]?.task_id,
                      duration: sessions[0]?.duration,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRef } from "react";

// Day View Component
function DayView({ sessions, selectedDate, setSelectedDate, tasks }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  const daySessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate.toDateString() === selectedDate.toDateString();
  });

  const focusSessions = daySessions.filter((s) => s.type === "FOCUS");
  const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Data for Focus by Tag chart
  const taskMap = tasks.reduce((acc, task) => {
    acc[task._id] = { title: task.title, tags: task.tags };
    return acc;
  }, {});

  const tagData = focusSessions.reduce((acc, session) => {
    const task = session.task_id ? taskMap[session.task_id] : null;
    const tags = task ? task.tags : ["Uncategorized"];

    tags.forEach((tag) => {
      if (!acc[tag]) {
        acc[tag] = 0;
      }
      acc[tag] += session.duration;
    });

    return acc;
  }, {});

  const chartData = Object.entries(tagData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Day View</h2>
          <p className="text-sm text-gray-500">
            Focus analytics for a specific day
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevDay}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
            <p className="text-sm font-semibold text-black text-center">
              {selectedDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Calendar className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {isCalendarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 z-10 right-0"
                  ref={calendarRef}
                >
                  <CalendarSelector
                    selectedDate={selectedDate}
                    setSelectedDate={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    sessions={sessions}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={nextDay}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-black">
                Daily Summary
              </h3>
            </div>

            <div className="space-y-6 flex-1">
              {/* Focus Time Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Focus Time
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-black">
                      {formatDuration(totalFocusTime)}
                    </span>
                    <p className="text-xs text-gray-500">
                      of {formatDuration(8 * 25 * 60)} goal
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <motion.div
                    className="bg-black h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((totalFocusTime / (8 * 25 * 60)) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {Math.round((totalFocusTime / (8 * 25 * 60)) * 100)}%
                    complete
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDuration(Math.max(0, 8 * 25 * 60 - totalFocusTime))}{" "}
                    remaining
                  </span>
                </div>
              </div>

              {/* Session Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      Sessions
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {focusSessions.length}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      Avg Duration
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {focusSessions.length > 0
                      ? formatDuration(totalFocusTime / focusSessions.length)
                      : "0m"}
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="space-y-3">
                {/* Break Analysis */}
                {focusSessions.length > 1 && (
                  <div className="p-3 rounded-xl border border-black-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Break Analysis
                      </span>
                    </div>
                    <div className="text-xs">
                      <p>
                        Avg break:{" "}
                        {(() => {
                          const breaks = [];
                          for (let i = 1; i < focusSessions.length; i++) {
                            const prevEnd = new Date(
                              focusSessions[i - 1].completedAt,
                            );
                            const currentStart = new Date(
                              focusSessions[i].completedAt,
                            );
                            const breakTime = (currentStart - prevEnd) / 1000;
                            if (breakTime > 0) breaks.push(breakTime);
                          }
                          const avgBreak =
                            breaks.length > 0
                              ? breaks.reduce((a, b) => a + b, 0) /
                                breaks.length
                              : 0;
                          return formatDuration(avgBreak);
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-black">
                Focus Time by Tag
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              See how you spent your focus time across different tags
            </p>

            {chartData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatDuration(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-full max-h-80 overflow-y-auto space-y-3 pr-2">
                  {chartData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-black">
                          {formatDuration(entry.value)}
                        </span>
                        <span className="text-sm text-gray-500 w-12 text-right">
                          {totalFocusTime > 0
                            ? `${((entry.value / totalFocusTime) * 100).toFixed(0)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No focus sessions for this day yet.
                  </p>
                  <p className="text-xs text-gray-400">
                    Start a focus session to see your analytics here!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <DailyTimeline sessions={daySessions} tasks={tasks} />
      </div>
    </motion.div>
  );
}

import CalendarSelector from "../../../components/shared/CalendarSelector";

// Week View Component
function WeekView({ sessions, tasks = [] }) {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  const getWeekDates = (date) => {
    const week = [];
    const first = new Date(date);
    first.setDate(first.getDate() - first.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(first);
      day.setDate(first.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedWeek);
  const weekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return (
      sessionDate >= weekDates[0] &&
      sessionDate <= weekDates[6] &&
      session.type === "FOCUS"
    );
  });

  const totalWeekTime = weekSessions.reduce((acc, s) => acc + s.duration, 0);

  const prevWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const dailyTotals = weekDates.map((date) => {
    const daySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt);
      return (
        sessionDate.toDateString() === date.toDateString() &&
        session.type === "FOCUS"
      );
    });
    return {
      date,
      sessions: daySessions.length,
      time: daySessions.reduce((acc, s) => acc + s.duration, 0),
    };
  });

  const maxTime = Math.max(...dailyTotals.map((d) => d.time), 1);
  const avgDailyTime = totalWeekTime / 7;
  const mostProductiveDay = dailyTotals.reduce(
    (max, day) => (day.time > max.time ? day : max),
    dailyTotals[0],
  );
  const streakDays = dailyTotals.filter((day) => day.sessions > 0).length;

  // Task mapping for categories
  const taskMap = tasks.reduce((acc, task) => {
    acc[task._id] = task;
    return acc;
  }, {});

  // Calculate tag data for the week
  const tagData = weekSessions.reduce((acc, session) => {
    const task = session.task_id ? taskMap[session.task_id] : null;
    const tags = task ? task.tags : ["Uncategorized"];

    tags.forEach((tag) => {
      if (!acc[tag]) {
        acc[tag] = 0;
      }
      acc[tag] += session.duration;
    });

    return acc;
  }, {});

  const chartData = Object.entries(tagData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Week View</h2>
          <p className="text-sm text-gray-500">
            Focus analytics for the selected week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
            <p className="text-sm font-semibold text-black text-center">
              {weekDates[0].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {weekDates[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Calendar className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {isCalendarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 z-10 right-0"
                  ref={calendarRef}
                >
                  <CalendarSelector
                    selectedDate={selectedWeek}
                    setSelectedDate={(date) => {
                      setSelectedWeek(date);
                      setIsCalendarOpen(false);
                    }}
                    sessions={sessions}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Weekly Summary */}
        <div className="lg:col-span-1 flex flex-col flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-black">
                Weekly Summary
              </h3>
            </div>

            <div className="space-y-6 flex-1">
              {/* Focus Time Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Total Focus Time
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-black">
                      {formatDuration(totalWeekTime)}
                    </span>
                    <p className="text-xs text-gray-500">
                      of {formatDuration(40 * 60 * 60)} goal
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <motion.div
                    className="bg-black h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((totalWeekTime / (40 * 60 * 60)) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {Math.round((totalWeekTime / (40 * 60 * 60)) * 100)}%
                    complete
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDuration(Math.max(0, 40 * 60 * 60 - totalWeekTime))}{" "}
                    remaining
                  </span>
                </div>
              </div>

              {/* Weekly Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      Sessions
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {weekSessions.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg {Math.round(weekSessions.length / 7)} per day
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      Daily Avg
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {formatDuration(avgDailyTime)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Target: 5h 45m per day
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="space-y-3">
                {/* Most Productive Day */}
                <div className="p-3 rounded-xl border border-black-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Most Productive</span>
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">
                      {mostProductiveDay.date.toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </p>
                    <p>
                      {formatDuration(mostProductiveDay.time)} •{" "}
                      {mostProductiveDay.sessions} sessions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Focus by Tag */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-black">
                Weekly Focus by Tag
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              See how you spent your focus time across different tags this week
            </p>

            {chartData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatDuration(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-full max-h-80 overflow-y-auto space-y-3 pr-2">
                  {chartData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-black">
                          {formatDuration(entry.value)}
                        </span>
                        <span className="text-sm text-gray-500 w-12 text-right">
                          {totalWeekTime > 0
                            ? `${((entry.value / totalWeekTime) * 100).toFixed(0)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No focus sessions for this week yet.
                  </p>
                  <p className="text-xs text-gray-400">
                    Start focus sessions to see your weekly analytics here!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Weekly Timeline */}
      <div>
        <WeeklyTimeline dailyTotals={dailyTotals} maxTime={maxTime} />
      </div>
    </motion.div>
  );
}

// Weekly Timeline Component
function WeeklyTimeline({ dailyTotals, maxTime }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const avgTime = dailyTotals.reduce((acc, day) => acc + day.time, 0) / 7;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-black mb-8 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-gray-500" />
        Weekly Timeline
      </h3>

      <div className="relative">
        {/* Background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between h-48 pointer-events-none">
          {[25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="w-full h-px bg-gray-100"
              style={{ opacity: percent === 50 ? 0.6 : 0.3 }}
            />
          ))}
        </div>

        {/* Average line */}
        {avgTime > 0 && (
          <div
            className="absolute w-full border-t-2 border-dashed border-gray-300 pointer-events-none z-10"
            style={{
              bottom: `${(avgTime / maxTime) * 192}px`,
            }}
          >
            <span className="absolute -right-12 -top-2 text-xs text-gray-500 bg-white px-1">
              avg
            </span>
          </div>
        )}

        <div className="flex items-end justify-between gap-4 h-48 relative z-20">
          {dailyTotals.map((day, index) => {
            const height = maxTime > 0 ? (day.time / maxTime) * 100 : 0;
            const isToday =
              day.date.toDateString() === new Date().toDateString();
            const isWeekend =
              day.date.getDay() === 0 || day.date.getDay() === 6;
            const hasActivity = day.sessions > 0;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-3 group"
                onMouseEnter={() => setHoveredDay(index)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Bar container */}
                <div className="w-full flex items-end justify-center h-48 relative">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${height}%`, opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className={`w-8 rounded-full relative cursor-pointer transition-all duration-300 ${
                      hasActivity
                        ? isToday
                          ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg group-hover:shadow-blue-200"
                          : isWeekend
                            ? "bg-gradient-to-t from-purple-500 to-purple-300 group-hover:shadow-purple-200"
                            : "bg-gradient-to-t from-gray-800 to-gray-600 group-hover:shadow-gray-200"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    } group-hover:scale-110 group-hover:shadow-lg`}
                  >
                    {/* Intensity indicator */}
                    {hasActivity && (
                      <div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: isToday
                            ? "#3b82f6"
                            : isWeekend
                              ? "#8b5cf6"
                              : "#374151",
                          opacity: day.time > avgTime ? 1 : 0.5,
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Enhanced tooltip */}
                  <AnimatePresence>
                    {hoveredDay === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 pointer-events-none"
                      >
                        <div className="bg-white px-4 py-3 rounded-xl shadow-2xl min-w-max border border-gray-200">
                          <div className="text-center space-y-1">
                            <p className="font-semibold text-sm">
                              {day.date.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-lg font-bold">
                              {formatDuration(day.time)}
                            </p>
                            <p className="text-xs opacity-80">
                              {day.sessions} session
                              {day.sessions !== 1 ? "s" : ""}
                            </p>
                            {day.time > avgTime && (
                              <div className="flex items-center justify-center gap-1 pt-1">
                                <TrendingUp className="w-3 h-3 text-green-400" />
                                <span className="text-xs text-green-400">
                                  Above average
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Day label */}
                <div className="text-center">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isToday
                        ? "text-blue-600"
                        : hasActivity
                          ? "text-gray-900 group-hover:text-black"
                          : "text-gray-400"
                    }`}
                  >
                    {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {day.date.getDate()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimalist footer */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-600 rounded-full" />
              <span className="text-gray-500">Weekday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-gray-500">Weekend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-gray-500">Today</span>
            </div>
          </div>
          <div className="text-gray-400">
            {dailyTotals.filter((d) => d.sessions > 0).length}/7 active days
          </div>
        </div>
      </div>
    </div>
  );
}

// Year View Component
function YearView({ sessions, currentDate, setCurrentDate, tasks = [] }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const year = currentDate.getFullYear();

  const prevYear = () => {
    setCurrentDate(new Date(year - 1, 0, 1));
  };

  const nextYear = () => {
    setCurrentDate(new Date(year + 1, 0, 1));
  };

  const yearSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate.getFullYear() === year && session.type === "FOCUS";
  });

  const totalYearTime = yearSessions.reduce((acc, s) => acc + s.duration, 0);
  const uniqueDays = new Set(
    yearSessions.map((s) => new Date(s.completedAt).toDateString()),
  ).size;
  const avgDailyTime = totalYearTime / Math.max(uniqueDays, 1);
  const yearGoal = 500 * 60 * 60; // 500 hours goal

  // Calculate streak data
  const calculateLongestStreak = () => {
    const days = yearSessions.map((s) =>
      new Date(s.completedAt).toDateString(),
    );
    const uniqueDays = [...new Set(days)].sort();

    let longestStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(uniqueDays[i - 1]);
        const currDate = new Date(uniqueDays[i]);
        const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }

    return Math.max(longestStreak, currentStreak);
  };

  const longestStreak = calculateLongestStreak();

  // Task mapping for categories
  const taskMap = tasks.reduce((acc, task) => {
    acc[task._id] = task;
    return acc;
  }, {});

  // Calculate tag data for the year
  const tagData = yearSessions.reduce((acc, session) => {
    const task = session.task_id ? taskMap[session.task_id] : null;
    const tags = task ? task.tags : ["Uncategorized"];

    tags.forEach((tag) => {
      if (!acc[tag]) {
        acc[tag] = 0;
      }
      acc[tag] += session.duration;
    });

    return acc;
  }, {});

  const chartData = Object.entries(tagData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Year View</h2>
          <p className="text-sm text-gray-500">
            Focus analytics for the selected year
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevYear}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
            <p className="text-sm font-semibold text-black text-center">
              {year}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Calendar className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {isCalendarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 z-10 right-0"
                  ref={calendarRef}
                >
                  <CalendarSelector
                    selectedDate={currentDate}
                    setSelectedDate={(date) => {
                      setCurrentDate(date);
                      setIsCalendarOpen(false);
                    }}
                    sessions={sessions}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={nextYear}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Yearly Summary */}
        <div className="lg:col-span-1 flex flex-col flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-black">
                {year} Summary
              </h3>
            </div>

            <div className="space-y-6 flex-1">
              {/* Focus Time Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Total Focus Time
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-black">
                      {formatDuration(totalYearTime)}
                    </span>
                    <p className="text-xs text-gray-500">
                      of {formatDuration(yearGoal)} goal
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <motion.div
                    className="bg-black h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((totalYearTime / yearGoal) * 100, 100)}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {Math.round((totalYearTime / yearGoal) * 100)}% complete
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDuration(Math.max(0, yearGoal - totalYearTime))}{" "}
                    remaining
                  </span>
                </div>
              </div>

              {/* Yearly Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      Sessions
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {yearSessions.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(yearSessions.length / 12)} per month
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">
                      Active Days
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-black">{uniqueDays}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((uniqueDays / 365) * 100)}% of year
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="space-y-3">
                {/* Longest Streak */}
                <div className="p-3 rounded-xl border border-black-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Longest Streak
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{longestStreak}</span>
                      <span className="text-sm"> days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Focus by Tag */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-96">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-black">
                {year} Focus by Tag
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              See how you spent your focus time across different tags this year
            </p>

            {chartData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatDuration(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-full max-h-64 overflow-y-auto space-y-3 pr-2">
                  {chartData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-black">
                          {formatDuration(entry.value)}
                        </span>
                        <span className="text-sm text-gray-500 w-12 text-right">
                          {totalYearTime > 0
                            ? `${((entry.value / totalYearTime) * 100).toFixed(0)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    No focus sessions for {year} yet.
                  </p>
                  <p className="text-xs text-gray-400">
                    Start focus sessions to see your yearly analytics here!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - GitHub-style Heatmap */}
      <div>
        <YearHeatmap sessions={yearSessions} year={year} />
      </div>
    </motion.div>
  );
}

// Helper Components

function StatCard({ icon: Icon, label, value, bgColor, textColor }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${bgColor} ${textColor} rounded-2xl p-6`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-sm opacity-90">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </motion.div>
  );
}

function DailyTimeline({ sessions, tasks = [] }) {
  const [hoveredSession, setHoveredSession] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    left: "50%",
    transform: "translateX(-50%)",
    arrowLeft: "50%",
    bottom: "200px",
    top: "auto",
    showAbove: true,
    horizontalOffset: 40,
    showOnLeft: false,
  });
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const timelineRef = useRef(null);

  const taskMap = tasks.reduce((acc, task) => {
    acc[task._id] = task;
    return acc;
  }, {});

  const timelineStartHour = 6; // 6 AM
  const timelineEndHour = 24; // Midnight
  const totalHours = timelineEndHour - timelineStartHour;

  const getPosition = (date) => {
    const sessionHour = date.getHours();
    const sessionMinute = date.getMinutes();
    const totalMinutes = (sessionHour - timelineStartHour) * 60 + sessionMinute;
    return (totalMinutes / (totalHours * 60)) * 100;
  };

  const tags = new Set();
  sessions.forEach((session) => {
    const task = session.task_id ? taskMap[session.task_id] : null;
    const sessionTags = task?.tags?.length ? task.tags : ["Untagged"];
    sessionTags.forEach((tag) => tags.add(tag));
  });
  const uniqueTags = Array.from(tags);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];
  const tagColorMap = uniqueTags.reduce((acc, tag, index) => {
    acc[tag] = COLORS[index % COLORS.length];
    return acc;
  }, {});

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6 relative"
      ref={timelineRef}
    >
      <h3 className="text-lg font-semibold text-black mb-5 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-500" />
        Daily Timeline
      </h3>
      <div className="relative h-24 w-full">
        {/* Enhanced Timeline Axis */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200" />

        {/* Enhanced Hour Markers and Labels */}
        {Array.from({ length: totalHours + 1 }, (_, i) => {
          const hour = timelineStartHour + i;
          if (hour > 24) return null;
          const position = (i / totalHours) * 100;
          const isMajorHour = hour % 3 === 0; // Major markers every 3 hours
          const isKeyHour = [9, 12, 15, 18].includes(hour); // Key work hours

          return (
            <div
              key={hour}
              className="absolute group"
              style={{
                left: `${position}%`,
                top: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {/* Marker Line - extends upward from timeline */}
              <div
                className={`transition-all duration-200 ${
                  isKeyHour
                    ? "w-1 h-4 bg-black"
                    : isMajorHour
                      ? "w-0.5 h-3 bg-gray-400"
                      : "w-0.5 h-2 bg-gray-300"
                } -translate-y-full`}
              />

              {/* Time Labels */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center">
                <span
                  className={`text-xs ${
                    isKeyHour
                      ? "text-black font-semibold"
                      : isMajorHour
                        ? "text-gray-600"
                        : "text-gray-400"
                  }`}
                >
                  {hour === 12
                    ? "12PM"
                    : hour === 24
                      ? "12AM"
                      : hour > 12
                        ? `${hour - 12}PM`
                        : `${hour}AM`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Quarter Hour Marks */}
        {Array.from({ length: totalHours * 4 }, (_, i) => {
          const quarterHour = i * 0.25;
          const hour = timelineStartHour + Math.floor(quarterHour);
          const minutes = (quarterHour % 1) * 60;

          if (hour > 24 || minutes === 0) return null; // Skip hour marks, already handled above

          const position = (quarterHour / totalHours) * 100;

          return (
            <div
              key={`quarter-${i}`}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${position}%` }}
            >
              <div className="w-px h-1 bg-gray-200 opacity-60" />
            </div>
          );
        })}

        {/* Enhanced Session Dots */}
        {sessions.map((session) => {
          const sessionDate = new Date(session.completedAt);
          const sessionHour = sessionDate.getHours();
          if (
            sessionHour < timelineStartHour ||
            sessionHour > timelineEndHour
          ) {
            return null;
          }
          const position = getPosition(sessionDate);
          const task = session.task_id ? taskMap[session.task_id] : null;
          const sessionTags = task?.tags?.length ? task.tags : ["Untagged"];
          const color = tagColorMap[sessionTags[0]];

          // Duration-based sizing and styling
          const durationMinutes = session.duration / 60;
          const isShortSession = durationMinutes < 20;
          const isMediumSession = durationMinutes >= 20 && durationMinutes < 40;
          const isLongSession = durationMinutes >= 40;

          const dotSize = isShortSession
            ? "w-2 h-3"
            : isMediumSession
              ? "w-2.5 h-4"
              : "w-3 h-5";

          const intensity = isShortSession ? 0.7 : isMediumSession ? 0.85 : 1;

          return (
            <div
              key={session._id}
              className="absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:z-20 group"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              onMouseEnter={() => {
                // Clear any existing timeout
                if (hoverTimeout) {
                  clearTimeout(hoverTimeout);
                  setHoverTimeout(null);
                }

                // Add slight delay for smoother interaction
                const timeout = setTimeout(() => {
                  setHoveredSession({ ...session, task, color, x: position });

                  // Calculate tooltip position on client side
                  if (timelineRef.current) {
                    const timelineRect =
                      timelineRef.current.getBoundingClientRect();
                    const tooltipWidth = 288; // w-72 in pixels
                    const tooltipHeight = 400; // estimated max height
                    const sessionX = (position / 100) * timelineRect.width;
                    const viewportHeight = window.innerHeight;
                    const scrollY = window.scrollY;

                    let finalLeft = `${position}%`;
                    let transform = "translateX(-50%)";
                    let arrowLeft = "50%";
                    let bottom = "200px";
                    let top = "auto";
                    let showAbove = true;
                    let horizontalOffset = 40; // Default right offset
                    let showOnLeft = false;

                    // Check horizontal positioning with right offset
                    if (position > 75) {
                      // Show on left side when near end of timeline (last 25%)
                      showOnLeft = true;
                      finalLeft = `${position}%`;
                      transform = "translateX(-100%)";
                      arrowLeft = `${tooltipWidth - 60}px`;
                      horizontalOffset = -60; // More offset for left side
                    } else if (sessionX < tooltipWidth / 2 + 60) {
                      // Near left edge - align to left with offset
                      finalLeft = "20px";
                      transform = "translateX(0)";
                      arrowLeft = `${Math.max(20, sessionX - 40)}px`;
                      horizontalOffset = 0;
                    } else {
                      // Default positioning with right offset
                      finalLeft = `${position}%`;
                      transform = "translateX(-50%)";
                      arrowLeft = "50%";
                    }

                    // Check vertical positioning
                    const timelineTop = timelineRect.top + scrollY;
                    const spaceAbove = timelineTop - scrollY;
                    const spaceBelow =
                      viewportHeight - (timelineRect.bottom - scrollY);

                    if (
                      spaceAbove < tooltipHeight + 20 &&
                      spaceBelow > tooltipHeight + 20
                    ) {
                      // Show below if not enough space above but enough below
                      showAbove = false;
                      bottom = "auto";
                      top = "200px";
                    }

                    setTooltipPosition({
                      left: finalLeft,
                      transform,
                      arrowLeft,
                      bottom: showAbove ? bottom : "auto",
                      top: showAbove ? "auto" : top,
                      showAbove,
                      horizontalOffset,
                      showOnLeft,
                    });
                  }
                }, 150); // 150ms delay

                setHoverTimeout(timeout);
              }}
              onMouseLeave={() => {
                // Clear timeout on mouse leave
                if (hoverTimeout) {
                  clearTimeout(hoverTimeout);
                  setHoverTimeout(null);
                }

                // Add small delay before hiding to prevent flickering
                setTimeout(() => setHoveredSession(null), 100);
              }}
            >
              {/* Enhanced hover area */}
              <div className="absolute -inset-6 rounded-full" />

              {/* Session intensity background */}
              <div
                className={`absolute -inset-1 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-30 ${
                  isLongSession ? "animate-pulse" : ""
                }`}
                style={{ backgroundColor: color }}
              />

              {/* Main enhanced dot */}
              <div
                className={`${dotSize} rounded-full border-2 transition-all duration-300 group-hover:scale-125 group-hover:shadow-xl relative z-10 ${
                  isLongSession ? "shadow-lg" : ""
                }`}
                style={{
                  backgroundColor: color,
                  borderColor: `${color}${Math.round(intensity * 255)
                    .toString(16)
                    .padStart(2, "0")}`,
                  opacity: intensity,
                  boxShadow:
                    hoveredSession?._id === session._id
                      ? `0 0 16px ${color}60, 0 0 32px ${color}30, 0 4px 16px rgba(0,0,0,0.1)`
                      : isLongSession
                        ? `0 2px 8px ${color}40`
                        : "none",
                }}
              />

              {/* Duration indicator ring for long sessions */}
              {isLongSession && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed opacity-40 group-hover:opacity-70 transition-all duration-300"
                  style={{
                    borderColor: color,
                    transform: "scale(1.6)",
                    animation: "spin 8s linear infinite",
                  }}
                />
              )}

              {/* Improved hover effects */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${color}15 0%, ${color}05 50%, transparent 100%)`,
                  transform: "scale(3)",
                }}
              />

              {/* Enhanced duration indicator */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none">
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-xl whitespace-nowrap border border-white/20"
                  style={{
                    backgroundColor: color,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isShortSession && <Zap className="w-3 h-3" />}
                    {isMediumSession && <Target className="w-3 h-3" />}
                    {isLongSession && <Flame className="w-3 h-3" />}
                    <span>{formatDuration(session.duration)}</span>
                  </div>
                  <div className="text-xs opacity-80 text-center mt-0.5">
                    {isShortSession
                      ? "Quick"
                      : isMediumSession
                        ? "Standard"
                        : "Deep Focus"}
                  </div>
                </div>
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                  style={{ borderTopColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Current Time Indicator */}
      {(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        if (
          currentHour >= timelineStartHour &&
          currentHour <= timelineEndHour
        ) {
          const currentPosition =
            ((currentHour - timelineStartHour + currentMinutes / 60) /
              totalHours) *
            100;

          return (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                left: `${currentPosition}%`,
                top: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {/* Current time line - extends upward from timeline */}
              <div className="w-0.5 h-8 bg-red-500 -translate-y-full">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Current time tooltip */}
              <div className="absolute -top-17 left-1/2 -translate-x-1/2">
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg whitespace-nowrap">
                  {now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-2 border-transparent border-t-red-500" />
              </div>
            </div>
          );
        }
        return null;
      })()}
      {/* Compact Legend */}
      <div className="mt-8 flex items-center justify-center flex-wrap gap-2">
        {uniqueTags.map((tag) => {
          const tagSessions = sessions.filter((s) => {
            const sessionTask = s.task_id ? taskMap[s.task_id] : null;
            const sessionTags = sessionTask?.tags?.length
              ? sessionTask.tags
              : ["Untagged"];
            return sessionTags.includes(tag);
          });

          return (
            <div
              key={tag}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full text-xs hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: tagColorMap[tag] }}
              />
              <span className="text-gray-700">{tag}</span>
              <span className="text-gray-500">({tagSessions.length})</span>
            </div>
          );
        })}
      </div>
      {/* Enhanced Tooltip */}
      <AnimatePresence>
        {hoveredSession && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
              scale: 0.9,
              x: tooltipPosition.showOnLeft ? -20 : 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.9,
              x: tooltipPosition.showOnLeft ? -20 : 20,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => {
              // Keep tooltip visible when hovering over it
              if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                setHoverTimeout(null);
              }
            }}
            onMouseLeave={() => {
              // Hide tooltip when leaving
              setTimeout(() => setHoveredSession(null), 100);
            }}
            className="absolute bg-white border border-gray-200 rounded-2xl shadow-2xl z-30 w-72 overflow-hidden"
            style={{
              bottom: tooltipPosition.bottom,
              top: tooltipPosition.top,
              left: `calc(${tooltipPosition.left} + ${tooltipPosition.horizontalOffset}px)`,
              transform: tooltipPosition.transform,
              "--arrow-left": tooltipPosition.arrowLeft,
            }}
          >
            {/* Arrow */}
            <div
              className={`absolute ${tooltipPosition.showAbove ? "top-full mt-2" : "bottom-full mb-2 rotate-180"}`}
              style={{
                left: tooltipPosition.showOnLeft
                  ? "calc(100% - 40px)"
                  : "var(--arrow-left, 50%)",
                transform: "translateX(-50%)",
              }}
            >
              <div className="border-8 border-transparent border-t-white" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 border-8 border-transparent border-t-gray-200" />
            </div>

            {/* Header with colored accent */}
            <div
              className="px-4 py-3 text-white relative overflow-hidden"
              style={{ backgroundColor: hoveredSession.color }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" />
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">
                      {hoveredSession.task?.title ||
                        hoveredSession.title ||
                        "Focus Session"}
                    </h4>
                    {tooltipPosition.showOnLeft && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs opacity-75 flex items-center gap-1"
                      >
                        <span>←</span> End view
                      </motion.div>
                    )}
                  </div>
                </div>
                <p className="text-xs opacity-90 flex items-center justify-between">
                  <span>Session #{sessions.indexOf(hoveredSession) + 1}</span>
                  {!tooltipPosition.showOnLeft && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs opacity-60"
                    >
                      →
                    </motion.span>
                  )}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Time and Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Start Time</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(hoveredSession.completedAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDuration(hoveredSession.duration)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Productivity Metrics */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Productivity
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">
                      {Math.round((hoveredSession.duration / (25 * 60)) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">of 25min</p>
                  </div>
                  <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${Math.min((hoveredSession.duration / (25 * 60)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              {hoveredSession.task?.tags &&
                hoveredSession.task.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {hoveredSession.task.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: `${hoveredSession.color}15`,
                            borderColor: `${hoveredSession.color}40`,
                            color: hoveredSession.color,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Session Context */}
              <div className="pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Session Type</p>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: hoveredSession.color }}
                      />
                      <span className="font-medium text-gray-700">
                        {hoveredSession.duration >= 25 * 60
                          ? "Deep Focus"
                          : hoveredSession.duration >= 15 * 60
                            ? "Focused Work"
                            : "Quick Task"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Intensity</p>
                    <div className="flex items-center gap-1">
                      {hoveredSession.duration >= 45 * 60 ? (
                        <>
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="font-medium text-orange-600">
                            High
                          </span>
                        </>
                      ) : hoveredSession.duration >= 25 * 60 ? (
                        <>
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-yellow-600">
                            Medium
                          </span>
                        </>
                      ) : (
                        <>
                          <Target className="w-3 h-3 text-blue-500" />
                          <span className="font-medium text-blue-600">
                            Light
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time until next session */}
              {(() => {
                const currentIndex = sessions.findIndex(
                  (s) => s._id === hoveredSession._id,
                );
                const nextSession = sessions[currentIndex + 1];

                if (nextSession) {
                  const breakTime =
                    (new Date(nextSession.completedAt) -
                      new Date(hoveredSession.completedAt)) /
                    1000;
                  return (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-700">
                          <span className="font-medium">Next session:</span>{" "}
                          {formatDuration(breakTime)} break
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeekSessionsList({ sessions, weekDates }) {
  const sessionsByDay = weekDates.map((date) => ({
    date,
    sessions: sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate.toDateString() === date.toDateString();
    }),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-black mb-4">Sessions by Day</h3>
      <div className="space-y-4">
        {sessionsByDay.map((day, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {day.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs text-gray-500">
                {day.sessions.length} sessions
              </span>
            </div>
            {day.sessions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {day.sessions.map((session) => (
                  <div
                    key={session._id}
                    className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-medium border border-gray-200"
                    title={new Date(session.completedAt).toLocaleTimeString()}
                  >
                    {formatDuration(session.duration)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No sessions</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function YearHeatmap({ sessions, year }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const today = new Date();

  // --- Initial Day Data Population (Unchanged) ---
  const dayData = {};
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toDateString();
    const daySessions = sessions.filter(
      (s) => new Date(s.completedAt).toDateString() === dateStr,
    );
    dayData[dateStr] = {
      date: new Date(currentDate),
      sessions: daySessions,
      totalTime: daySessions.reduce((acc, s) => acc + s.duration, 0),
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // --- REWRITTEN: Build weekly grid for each month independently ---
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    weeks: [],
  }));

  // Group all day data objects by their month
  Object.values(dayData).forEach((day) => {
    const monthIndex = day.date.getMonth();
    if (!months[monthIndex].days) {
      months[monthIndex].days = [];
    }
    months[monthIndex].days.push(day);
  });

  // For each month, structure its own days into a weekly grid
  months.forEach((monthData) => {
    if (!monthData.days || monthData.days.length === 0) return;

    let currentWeek = [];
    const firstDayOfMonth = monthData.days[0].date.getDay(); // 0 = Sunday, 1 = Monday...

    // 1. Pad the first week with nulls to align it correctly
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(null);
    }

    // 2. Add the actual days of the month
    monthData.days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        monthData.weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // 3. Add the final, possibly incomplete week
    if (currentWeek.length > 0) {
      monthData.weeks.push(currentWeek);
    }

    // Clean up temporary array
    delete monthData.days;
  });

  // --- Helper Functions and Constants (Unchanged) ---
  const getIntensity = (day) => {
    if (!day || day.sessions.length === 0) return 0;
    if (day.totalTime < 1800) return 1;
    if (day.totalTime < 3600) return 2;
    if (day.totalTime < 7200) return 3;
    return 4;
  };
  const getIntensityColor = (intensity, isToday = false) => {
    if (isToday) {
      if (intensity === 0) return "bg-gray-300 border-2 border-gray-600";
      if (intensity === 1) return "bg-gray-400 border-2 border-gray-700";
      return "bg-gray-900 border-2 border-black";
    }
    if (intensity === 0) return "bg-gray-100 hover:bg-gray-200";
    if (intensity === 1) return "bg-gray-300 hover:bg-gray-400";
    if (intensity === 2) return "bg-gray-500 hover:bg-gray-600";
    if (intensity === 3) return "bg-gray-700 hover:bg-gray-800";
    return "bg-gray-900 hover:bg-black";
  };
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const totalContributions = sessions.length;
  const activeDays = Object.values(dayData).filter(
    (day) => day.sessions.length > 0,
  ).length;

  let dayCounter = 0; // Counter for staggered animation delay

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header (Unchanged) */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-black flex items-center gap-2">
            <Copy className="w-5 h-5 text-gray-500" />
            Focus Activity in {year}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {totalContributions} sessions across {activeDays} days
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${getIntensityColor(i)} border border-gray-200`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      <div className="relative">
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2 text-xs text-gray-500 pt-7">
            <div className="h-4"></div>
            <div className="h-4 flex items-center">Mon</div>
            <div className="h-4"></div>
            <div className="h-4 flex items-center">Wed</div>
            <div className="h-4"></div>
            <div className="h-4 flex items-center">Fri</div>
            <div className="h-4"></div>
          </div>

          {/* Corrected Heatmap Grid */}
          <div className="overflow-x-auto flex-1">
            <div className="inline-flex gap-4">
              {" "}
              {/* Spacing between months */}
              {months.map(({ month, weeks }) => (
                <div key={month}>
                  <div className="text-xs text-gray-500 mb-2 ml-1">
                    {monthLabels[month]}
                  </div>
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                          const day = week[dayIndex] || null;
                          if (day) dayCounter++;
                          const isToday =
                            day &&
                            day.date.toDateString() === today.toDateString();
                          const intensity = day ? getIntensity(day) : 0;

                          return (
                            <motion.div
                              key={dayIndex}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: day ? dayCounter * 0.003 : 0, // Adjusted animation delay
                                type: "spring",
                                stiffness: 200,
                              }}
                              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                                day
                                  ? `${getIntensityColor(intensity, isToday)} cursor-pointer transform hover:scale-125`
                                  : "bg-transparent"
                              }`}
                              onMouseEnter={(e) => {
                                if (day) {
                                  const rect = e.target.getBoundingClientRect();
                                  setTooltipPosition({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 10,
                                  });
                                  setHoveredDay(day);
                                }
                              }}
                              onMouseLeave={() => setHoveredDay(null)}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="fixed pointer-events-none z-50"
              style={{
                left: tooltipPosition.x - 100,
                top: tooltipPosition.y - 100,
                transform: "translateX(-50%) translateY(-100%)",
              }}
            >
              <div className="bg-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700">
                <div className="text-center space-y-1">
                  <p className="font-semibold text-sm">
                    {hoveredDay.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-lg font-bold">
                    {hoveredDay.sessions.length} session
                    {hoveredDay.sessions.length !== 1 ? "s" : ""}
                  </p>
                  {hoveredDay.totalTime > 0 && (
                    <p className="text-sm opacity-80">
                      {formatDuration(hoveredDay.totalTime)} focused
                    </p>
                  )}
                  {hoveredDay.sessions.length === 0 && (
                    <p className="text-sm opacity-60">No sessions</p>
                  )}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm w-full">
        <div className="text-gray-600">Learn how we count contributions</div>
        <div className="flex items-center gap-4 text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-700 rounded-full" /> 
            <span>{activeDays} active days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FocusPoints({ sessions, year }) {
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const uniqueDays = new Set(
    sessions.map((s) => new Date(s.completedAt).toDateString()),
  ).size;

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.completedAt) - new Date(b.completedAt),
  );

  sortedSessions.forEach((session) => {
    const sessionDate = new Date(session.completedAt);
    sessionDate.setHours(0, 0, 0, 0);

    if (!prevDate) {
      currentStreak = 1;
    } else {
      const dayDiff = (sessionDate - prevDate) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) {
        currentStreak++;
      } else if (dayDiff > 1) {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    prevDate = sessionDate;
  });

  maxStreak = Math.max(maxStreak, currentStreak);

  const points = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Target,
      color: "bg-black",
    },
    {
      label: "Focus Days",
      value: uniqueDays,
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      label: "Total Hours",
      value: Math.floor(totalTime / 3600),
      icon: Clock,
      color: "bg-green-500",
    },
    {
      label: "Longest Streak",
      value: `${maxStreak} days`,
      icon: Flame,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-black mb-6">
        Focus Points - {year}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {points.map((point, index) => {
          const Icon = point.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="text-center"
            >
              <div
                className={`w-16 h-16 rounded-full ${point.color} mx-auto mb-3 flex items-center justify-center`}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-bold text-black mb-1">
                {point.value}
              </p>
              <p className="text-xs text-gray-500 font-medium">{point.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Utility Functions

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function generateCalendarDays(date, sessions) {
  const days = [];
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push({ number: null, intensity: 0, focusTime: null });
  }

  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(year, month, i);
    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.completedAt);
      return (
        sessionDate.toDateString() === dayDate.toDateString() &&
        s.type === "FOCUS"
      );
    });

    const totalTime = daySessions.reduce((acc, s) => acc + s.duration, 0);
    let intensity = 0;

    if (totalTime > 0) {
      if (totalTime < 1800) intensity = 1;
      else if (totalTime < 3600) intensity = 2;
      else intensity = 3;
    }

    days.push({
      number: i,
      intensity,
      focusTime: totalTime > 0 ? formatDuration(totalTime) : null,
      sessions: daySessions.length,
    });
  }

  return days;
}
