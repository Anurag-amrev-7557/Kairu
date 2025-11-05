"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  RotateCcw,
  TrendingUp,
  Target,
  Flame,
  Trophy,
  Brain,
  Activity,
  BarChart3,
  Sparkles,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Zap,
  Clock,
  Calendar,
  Award,
  Copy,
} from "lucide-react";
import useTaskStore from "@/lib/store/taskStore";

const InsightIcon = ({ type }) => {
  switch (type) {
    case "success":
      return <Sparkles className="w-5 h-5 text-green-500" />;
    case "warning":
      return <Lightbulb className="w-5 h-5 text-yellow-500" />;
    case "info":
      return <Lightbulb className="w-5 h-5 text-blue-500" />;
    case "tip":
      return <Lightbulb className="w-5 h-5 text-purple-500" />;
    default:
      return <Lightbulb className="w-5 h-5 text-gray-500" />;
  }
};

const InsightBadge = ({ type }) => {
  const colors = {
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    tip: "bg-purple-50 text-purple-700 border border-purple-200",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[type] || "bg-gray-50 text-gray-700 border border-gray-200"}`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export default function InsightsPage() {
  const { data: session } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTasks();
      fetchInsights();
    }
  }, [session, fetchTasks]);

  const fetchInsights = async () => {
    if (!session?.user?.id) {
      setError("Please sign in to view insights");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/ai/insights");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success && data.insights) {
        setInsights(data.insights);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No insights available");
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(err.message || "Failed to fetch insights");
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchTasks();
    fetchInsights();
  };

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const previousInsight = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const currentInsight = insights[currentIndex];

  // Get focus session data from localStorage
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem("focusSessions");
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Calculate stats
  const today = new Date();
  const todaySessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate.toDateString() === today.toDateString();
  });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate >= weekAgo && session.type === "FOCUS";
  });

  const focusSessions = todaySessions.filter((s) => s.type === "FOCUS");
  const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const weekFocusTime = weekSessions.reduce((acc, s) => acc + s.duration, 0);

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

  const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="max-h-screen bg-white p-6">
      <div className="max-w-[90rem] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">AI Insights</h1>
            <p className="text-gray-500 text-sm">
              AI-powered analysis of your productivity patterns and personalized
              recommendations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleRefresh}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="h-full p-2 md:p-0"
          >
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
                        className="text-6xl font-semibold mb-10 opacity-90"
                      >
                        {streak}
                      </motion.div>
                      <p className="text-sm opacity-90">days in a row</p>
                    </div>

                    <div className="flex items-center justify-center gap-1 pt-2 border-t border-gray-200">
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
                {/* Main AI Insights Card - Expanded */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1"
                >
                  <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-all duration-300 hover:border-gray-300 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                          <Brain className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-black">
                            AI Insights
                          </h3>
                          <p className="text-xs text-gray-500">
                            Personalized recommendations
                          </p>
                        </div>
                      </div>
                      {insights.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={previousInsight}
                            disabled={insights.length <= 1}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                          </button>
                          <span className="text-xs font-medium text-gray-500">
                            {currentIndex + 1}/{insights.length}
                          </span>
                          <button
                            onClick={nextInsight}
                            disabled={insights.length <= 1}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-8 w-8 bg-gray-200 rounded-full animate-spin border-2 border-gray-300 border-t-black"></div>
                          <div className="text-sm text-gray-400">
                            Analyzing your patterns...
                          </div>
                        </div>
                      ) : error ? (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lightbulb className="w-6 h-6 text-red-500" />
                          </div>
                          <p className="font-medium text-red-600 mb-2">
                            {error}
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Please try again later
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                          >
                            Try Again
                          </motion.button>
                        </div>
                      ) : !insights || insights.length === 0 ? (
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-6 h-6 text-purple-600" />
                          </div>
                          <p className="font-medium text-gray-900 mb-2">
                            Complete more focus sessions to unlock AI insights!
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Track your productivity to get personalized
                            recommendations
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              (window.location.href = "/dashboard/focus")
                            }
                            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors inline-flex items-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            <span className="font-medium">
                              Start Focus Session
                            </span>
                          </motion.button>
                        </div>
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                                <InsightIcon type={currentInsight.type} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900 text-lg">
                                    {currentInsight.title}
                                  </h3>
                                  <InsightBadge type={currentInsight.type} />
                                </div>
                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                  {currentInsight.description}
                                </p>
                                {currentInsight.metric && (
                                  <div className="bg-gray-50 px-3 py-2 rounded-lg inline-block border border-gray-200 mb-3">
                                    <span className="text-sm font-semibold text-black">
                                      {currentInsight.metric}
                                    </span>
                                  </div>
                                )}
                                {currentInsight.suggestion && (
                                  <div className="mt-3 p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                                    <div className="flex items-start gap-2">
                                      <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs font-semibold text-purple-900 mb-1">
                                          Suggestion
                                        </p>
                                        <p className="text-sm text-purple-700">
                                          {currentInsight.suggestion}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* How It Works Card - At Bottom */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">
                          How It Works
                        </h3>
                        <p className="text-xs opacity-75">
                          AI-powered analysis
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">
                            1
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-semibold text-black">
                              Data Analysis:
                            </span>{" "}
                            We analyze your focus sessions and task patterns
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-purple-600">
                            2
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-semibold text-black">
                              Pattern Recognition:
                            </span>{" "}
                            AI identifies trends and improvement areas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-green-600">
                            3
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-semibold text-black">
                              Recommendations:
                            </span>{" "}
                            Get personalized, actionable suggestions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* Progress Overview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-black">
                          Progress Overview
                        </h3>
                        <p className="text-xs text-gray-500">Key metrics</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-1 mb-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-medium text-blue-900">
                            Focus Score
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {sessions.length > 0 ? "85%" : "N/A"}
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          Last 7 days
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center gap-1 mb-2">
                          <Copy className="w-4 h-4 text-purple-600" />
                          <p className="text-xs font-medium text-purple-900">
                            Tasks
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {tasks.length}
                        </div>
                        <div className="text-xs text-purple-700 mt-1">
                          Active tasks
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <div className="flex items-center gap-1 mb-2">
                          <Flame className="w-4 h-4 text-orange-600" />
                          <p className="text-xs font-medium text-orange-900">
                            Streak
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                          {streak}
                        </div>
                        <div className="text-xs text-orange-700 mt-1">
                          Day streak
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="flex items-center gap-1 mb-2">
                          <Trophy className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-medium text-green-900">
                            Sessions
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {sessions.length}
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          All time
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <Activity className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-black">
                          Quick Actions
                        </h3>
                        <p className="text-xs text-gray-500">
                          Productivity tools
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRefresh}
                        className="p-3 flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <RotateCcw className="w-5 h-5 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">
                          Refresh
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          (window.location.href = "/dashboard/focus")
                        }
                        className="p-3 flex flex-col items-center justify-center gap-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                      >
                        <Brain className="w-5 h-5" />
                        <span className="text-xs font-medium">Start Focus</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          (window.location.href = "/dashboard/analytics")
                        }
                        className="p-3 flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-xs font-medium">Analytics</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          (window.location.href = "/dashboard/tasks")
                        }
                        className="p-3 flex flex-col items-center justify-center gap-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                      >
                        <Target className="w-5 h-5" />
                        <span className="text-xs font-medium">Tasks</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
