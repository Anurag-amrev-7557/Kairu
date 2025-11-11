"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTaskStore from "@/lib/store/taskStore";
import { useSession } from "next-auth/react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Settings,
  Volume2,
  VolumeX,
  Target,
  Zap,
  Award,
  ChevronDown,
  X,
} from "lucide-react";

const SESSION_TYPES = {
  FOCUS: { duration: 25 * 60, label: "Focus", color: "black", icon: Brain },
  SHORT_BREAK: {
    duration: 5 * 60,
    label: "Short Break",
    color: "blue",
    icon: Coffee,
  },
  LONG_BREAK: {
    duration: 15 * 60,
    label: "Long Break",
    color: "green",
    icon: Coffee,
  },
};

export default function FocusPage() {
  const [isClient, setIsClient] = useState(false);
  const { tasks, fetchTasks, loading, error } = useTaskStore();
  const { data: session } = useSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session?.user?.token) {
      fetchTasks(
        { sortBy: "createdAt", sortOrder: "desc" },
        session.user.token,
      ).catch((err) => {
        console.error("Failed to fetch tasks:", err);
      });
    }
  }, [session, fetchTasks]);

  const [sessionType, setSessionType] = useState("FOCUS");
  const [timeLeft, setTimeLeft] = useState(SESSION_TYPES.FOCUS.duration);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  // const [tasks, setTasks] = useState([]);
  const [customDurations, setCustomDurations] = useState({
    FOCUS: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
  });
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Load data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("focusSessions");
    const savedTasks = localStorage.getItem("tasks");
    const savedSettings = localStorage.getItem("focusSettings");

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSoundEnabled(settings.soundEnabled ?? true);
      setCustomDurations(settings.customDurations || customDurations);
    }
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem(
      "focusSettings",
      JSON.stringify({ soundEnabled, customDurations }),
    );
  }, [soundEnabled, customDurations]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    playSound();

    // Save session
    const newSession = {
      _id: `session-${Date.now()}`,
      type: sessionType,
      duration: customDurations[sessionType] * 60,
      completedAt: new Date().toISOString(),
      task_id: selectedTask?._id,
      title: selectedTask?.title,
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem("focusSessions", JSON.stringify(updatedSessions));

    if (sessionType === "FOCUS") {
      setCompletedPomodoros((prev) => prev + 1);
    }

    // Auto-switch to break or focus
    if (sessionType === "FOCUS") {
      if ((completedPomodoros + 1) % 4 === 0) {
        switchSession("LONG_BREAK");
      } else {
        switchSession("SHORT_BREAK");
      }
    } else {
      switchSession("FOCUS");
    }
  };

  const switchSession = (type) => {
    setSessionType(type);
    setTimeLeft(customDurations[type] * 60);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customDurations[sessionType] * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    return (
      ((customDurations[sessionType] * 60 - timeLeft) /
        (customDurations[sessionType] * 60)) *
      100
    );
  };

  const updateCustomDuration = (type, minutes) => {
    const newDurations = { ...customDurations, [type]: minutes };
    setCustomDurations(newDurations);
    if (sessionType === type && !isActive) {
      setTimeLeft(minutes * 60);
    }
  };

  // Get statistics
  const todaySessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const weekSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });

  const todayFocusTime = todaySessions
    .filter((s) => s.type === "FOCUS")
    .reduce((acc, s) => acc + s.duration, 0);

  const todayFocusSessions = todaySessions.filter(
    (s) => s.type === "FOCUS",
  ).length;
  const weekFocusSessions = weekSessions.filter(
    (s) => s.type === "FOCUS",
  ).length;

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

  const deleteSession = (sessionId) => {
    const updatedSessions = sessions.filter((s) => s._id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem("focusSessions", JSON.stringify(updatedSessions));
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Focus</h1>
            <p className="text-gray-500 text-sm">
              {isActive ? "Stay focused on your work" : "Start a focus session"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gray-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-600" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-black mb-4">
                  Timer Settings
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(SESSION_TYPES).map(([key, type]) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 mb-2 block">
                        {type.label} (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={customDurations[key]}
                        onChange={(e) =>
                          updateCustomDuration(
                            key,
                            parseInt(e.target.value) || 1,
                          )
                        }
                        disabled={isActive}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Toggler + Stats Bar */}
        <div className="mb-6 flex items-center gap-4">
          {/* Session Type Selector */}
          <div className="flex bg-gray-100 rounded-full p-1">
            {Object.entries(SESSION_TYPES).map(([key, type]) => {
              const Icon = type.icon;
              const isSelected = sessionType === key;

              return (
                <motion.button
                  key={key}
                  onClick={() => !isActive && switchSession(key)}
                  disabled={isActive}
                  whileTap={{ scale: isActive ? 1 : 0.95 }}
                  className={`relative px-4.5 py-2.5 rounded-full transition-colors ${
                    isSelected
                      ? "text-white"
                      : "text-gray-600 disabled:opacity-50"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="sessionBackground"
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
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Compact Stats Bar */}
          <div className="flex-1 bg-gray-50 rounded-full px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Today</span>
              <span className="text-sm font-bold text-black">
                {todayFocusSessions}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Week</span>
              <span className="text-sm font-bold text-black">
                {weekFocusSessions}
              </span>
            </div>

            <div className="w-px h-4 bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Streak</span>
              <span className="text-sm font-bold text-black">{streak}</span>
            </div>

            <div className="w-px h-4 bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Time</span>
              <span className="text-sm font-bold text-black">
                {Math.floor(todayFocusTime / 60)}m
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Selector */}
            {sessionType === "FOCUS" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <button
                  onClick={() => setShowTaskSelector(!showTaskSelector)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedTask
                        ? selectedTask.title
                        : "Select a task to focus on"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {showTaskSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-64 overflow-y-auto"
                    >
                      {loading ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">
                          Loading tasks...
                        </div>
                      ) : error ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-red-400 mb-3">
                            Failed to load tasks
                          </p>
                          <button
                            onClick={() => {
                              if (session?.user?.token) {
                                fetchTasks(
                                  { sortBy: "createdAt", sortOrder: "desc" },
                                  session.user.token,
                                ).catch((err) => {
                                  console.error("Failed to fetch tasks:", err);
                                });
                              }
                            }}
                            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      ) : tasks && tasks.length > 0 ? (
                        <div>
                          <button
                            onClick={() => {
                              setSelectedTask(null);
                              setShowTaskSelector(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            No task selected
                          </button>
                          {tasks.map((task) => (
                            <button
                              key={task._id}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskSelector(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5  ${
                                    task.priority === "high"
                                      ? "bg-red-500"
                                      : task.priority === "medium"
                                        ? "bg-yellow-500"
                                        : "bg-blue-500"
                                  }`}
                                ></div>
                                <span className="flex-1 truncate">
                                  {task.title}
                                </span>
                                {task.category && (
                                  <span className="text-xs text-gray-400">
                                    {task.category}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">
                          No tasks available
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Timer Display */}
            <motion.div
              key={sessionType}
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-16 flex flex-col items-center justify-center border border-gray-100"
            >
              {/* Minimalist Progress Ring */}
              <div className="relative w-72 h-72 mb-8">
                <svg className="w-full h-full -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="144"
                    cy="144"
                    r="136"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="2"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="144"
                    cy="144"
                    r="136"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 136}`}
                    strokeDashoffset={`${2 * Math.PI * 136 * (1 - getProgress() / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>

                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      key={timeLeft}
                      initial={{ scale: 1.02 }}
                      animate={{ scale: 1 }}
                      className="text-7xl font-light tracking-tight text-black tabular-nums mb-2"
                    >
                      {formatTime(timeLeft)}
                    </motion.div>
                    <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
                      {SESSION_TYPES[sessionType].label}
                    </p>
                    {selectedTask && sessionType === "FOCUS" && (
                      <p className="text-xs text-gray-500 mt-2 truncate max-w-xs">
                        {selectedTask.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  {isActive ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="w-11 h-11 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            {/* Today's Progress */}
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-black mb-4">
                Today's Progress
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Pomodoros</span>
                    <span className="text-sm font-bold text-black">
                      {todayFocusSessions} / 8
                    </span>
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full ${
                          i < todayFocusSessions ? "bg-black" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Focus Time</span>
                    <span className="text-sm font-bold text-black">
                      {Math.floor(todayFocusTime / 60)}m
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((todayFocusTime / (8 * customDurations.FOCUS * 60)) * 100, 100)}%`,
                      }}
                      className="h-full bg-black rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-black mb-4">
                Recent Activity
              </h3>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {sessions.slice(0, 8).map((session) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: 20,
                        transition: { duration: 0.2 },
                      }}
                      className="bg-white rounded-xl p-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              session.type === "FOCUS"
                                ? "bg-black"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <span className="text-xs font-medium text-gray-700">
                            {SESSION_TYPES[session.type].label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {Math.floor(session.duration / 60)}m
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(session.completedAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteSession(session._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                      {session.title && (
                        <p className="text-xs text-gray-500 truncate ml-3.5">
                          {session.title}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {sessions.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-8">
                    No sessions yet. Start your first focus session!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
