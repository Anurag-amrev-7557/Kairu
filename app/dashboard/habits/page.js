"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Plus,
  Check,
  X,
  Trash2,
  Edit2,
  Archive,
  Calendar,
  Flame,
  Target,
  TrendingUp,
  Clock,
  MoreVertical,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Dumbbell,
  BookOpen,
  Brain,
  Footprints,
  DollarSign,
  Palette,
  Leaf,
  Coffee,
  Star,
  Rocket,
} from "lucide-react";

const CATEGORIES = [
  { value: "health", label: "Health", color: "#10B981" },
  { value: "productivity", label: "Productivity", color: "#3B82F6" },
  { value: "learning", label: "Learning", color: "#8B5CF6" },
  { value: "fitness", label: "Fitness", color: "#EF4444" },
  { value: "mindfulness", label: "Mindfulness", color: "#EC4899" },
  { value: "social", label: "Social", color: "#F59E0B" },
  { value: "finance", label: "Finance", color: "#14B8A6" },
  { value: "other", label: "Other", color: "#6B7280" },
];

const ICONS = [
  { icon: Target, name: "target" },
  { icon: Dumbbell, name: "dumbbell" },
  { icon: BookOpen, name: "book" },
  { icon: Brain, name: "brain" },
  { icon: Footprints, name: "footprints" },
  { icon: DollarSign, name: "dollar" },
  { icon: Palette, name: "palette" },
  { icon: Leaf, name: "leaf" },
  { icon: Coffee, name: "coffee" },
  { icon: Flame, name: "flame" },
  { icon: Star, name: "star" },
  { icon: Rocket, name: "rocket" },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitsPage() {
  const { data: session } = useSession();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "target",
    color: "#3B82F6",
    category: "other",
    frequency: "daily",
    target_days: [0, 1, 2, 3, 4, 5, 6],
    reminder_enabled: false,
    reminder_time: "09:00",
    difficulty: "medium",
  });

  useEffect(() => {
    if (session?.user?.token) {
      loadHabits();
    }
  }, [session]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch("/api/habits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load habits");
      }

      setHabits(data.habits || []);
    } catch (error) {
      console.error("Error loading habits:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to load habits",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Please enter a habit title" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create habit");
      }

      setMessage({ type: "success", text: "Habit created successfully!" });
      setShowCreateModal(false);
      resetForm();
      await loadHabits();
    } catch (error) {
      console.error("Error creating habit:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to create habit",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateHabit = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Please enter a habit title" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch("/api/habits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          habitId: selectedHabit._id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update habit");
      }

      setMessage({ type: "success", text: "Habit updated successfully!" });
      setShowEditModal(false);
      setSelectedHabit(null);
      resetForm();
      await loadHabits();
    } catch (error) {
      console.error("Error updating habit:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update habit",
      });
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (habit) => {
    setHabitToDelete(habit);
    setShowDeleteModal(true);
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch(`/api/habits?habitId=${habitToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete habit");
      }

      setMessage({ type: "success", text: "Habit deleted successfully!" });
      setShowDeleteModal(false);
      setHabitToDelete(null);
      await loadHabits();
    } catch (error) {
      console.error("Error deleting habit:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to delete habit",
      });
      setShowDeleteModal(false);
      setHabitToDelete(null);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (habit) => {
    const isCompleted = habit.isCompletedToday;

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch("/api/habits/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          habitId: habit._id,
          date: new Date().toISOString(),
          completed: !isCompleted,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update habit");
      }

      // Update local state
      setHabits((prev) =>
        prev.map((h) =>
          h._id === habit._id
            ? {
                ...h,
                isCompletedToday: !isCompleted,
                current_streak: data.habit.current_streak,
                total_completions: data.habit.total_completions,
              }
            : h,
        ),
      );
    } catch (error) {
      console.error("Error toggling habit:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update habit",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "target",
      color: "#3B82F6",
      category: "other",
      frequency: "daily",
      target_days: [0, 1, 2, 3, 4, 5, 6],
      reminder_enabled: false,
      reminder_time: "09:00",
      difficulty: "medium",
    });
  };

  const openEditModal = (habit) => {
    setSelectedHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description || "",
      icon: habit.icon,
      color: habit.color,
      category: habit.category,
      frequency: habit.frequency,
      target_days: habit.target_days,
      reminder_enabled: habit.reminder_enabled,
      reminder_time: habit.reminder_time,
      difficulty: habit.difficulty,
    });
    setShowEditModal(true);
  };

  const getTodayStats = () => {
    const todayHabits = habits.filter((h) => h.isDueToday && !h.is_archived);
    const completedToday = todayHabits.filter((h) => h.isCompletedToday).length;
    const totalToday = todayHabits.length;
    const completionRate =
      totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    return { completedToday, totalToday, completionRate };
  };

  const getOverallStats = () => {
    const activeHabits = habits.filter((h) => !h.is_archived);
    const totalStreak = activeHabits.reduce(
      (sum, h) => sum + (h.current_streak || 0),
      0,
    );
    const avgCompletionRate =
      activeHabits.length > 0
        ? Math.round(
            activeHabits.reduce((sum, h) => sum + (h.completionRate || 0), 0) /
              activeHabits.length,
          )
        : 0;

    return { totalStreak, avgCompletionRate, activeCount: activeHabits.length };
  };

  const stats = getTodayStats();
  const overallStats = getOverallStats();

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Habits</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Build better habits, one day at a time
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </motion.button>
        </motion.div>

        {/* Stats Bar - Compact Kanban Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-6 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-black"></div>
            <span className="text-xs text-gray-500">Today</span>
            <span className="text-sm font-semibold text-black">
              {stats.completedToday}/{stats.totalToday}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-900"></div>
            <span className="text-xs text-gray-500">Streaks</span>
            <span className="text-sm font-semibold text-black">
              {overallStats.totalStreak}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
            <span className="text-xs text-gray-500">Rate</span>
            <span className="text-sm font-semibold text-black">
              {stats.completionRate}%
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-xs text-gray-500">Active</span>
            <span className="text-sm font-semibold text-black">
              {overallStats.activeCount}
            </span>
          </div>
        </motion.div>

        {/* Message Banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-gray-900 text-white border-gray-800"
                  : "bg-gray-100 text-gray-900 border-gray-300"
              }`}
            >
              {message.type === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Habits List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black tracking-tight">
              Today's Habits
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {stats.completedToday} of {stats.totalToday} completed
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  No habits yet
                </h3>
                <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
                  Create your first habit to start building better routines
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Habit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {habits
                  .filter((h) => !h.is_archived)
                  .map((habit, index) => (
                    <motion.div
                      key={habit._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.03,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                      className="group flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(habit)}
                        disabled={!habit.isDueToday}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                          habit.isCompletedToday
                            ? "bg-gray-900 text-white"
                            : habit.isDueToday
                              ? "bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600"
                              : "bg-gray-50 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {habit.isCompletedToday ? (
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          (() => {
                            const HabitIcon =
                              ICONS.find((i) => i.name === habit.icon)?.icon ||
                              Target;
                            return (
                              <HabitIcon className="w-4 h-4" strokeWidth={2} />
                            );
                          })()
                        )}
                      </button>

                      {/* Habit Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {habit.title}
                          </h3>
                          {habit.current_streak > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded flex-shrink-0">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span className="text-[10px] font-bold text-orange-700">
                                {habit.current_streak}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="capitalize">{habit.category}</span>
                          <span className="text-gray-300">•</span>
                          <span className="capitalize">{habit.frequency}</span>
                          {habit.isDueToday && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-900 font-medium">
                                Due today
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-center flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <Flame className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-900">
                            {habit.current_streak}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-900">
                            {habit.completionRate}%
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="relative flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(habit);
                          }}
                          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit habit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(habit);
                          }}
                          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Delete habit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => {
              showCreateModal && setShowCreateModal(false);
              showEditModal && setShowEditModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Compact Header with visual flair */}
              <div className="relative px-5 py-4 bg-gradient-to-br from-gray-900 to-black border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      {showCreateModal ? (
                        <Plus className="w-4 h-4 text-white" />
                      ) : (
                        <Edit2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {showCreateModal ? "Create Habit" : "Edit Habit"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {showCreateModal
                          ? "Build consistency, one day at a time"
                          : "Update your habit"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showCreateModal && setShowCreateModal(false);
                      showEditModal && setShowEditModal(false);
                      resetForm();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content - Compact Grid Layout */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  {/* Title & Description - Compact */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-1.5">
                        Habit Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        placeholder="e.g., Morning meditation"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-1.5">
                        Description (optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                        placeholder="Quick note about this habit"
                      />
                    </div>
                  </div>

                  {/* Icon & Category - Modern Full Width Layout */}
                  <div className="space-y-4">
                    {/* Icon Selection - Horizontal Scroll */}
                    <div>
                      <label className="text-base font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Choose Icon
                      </label>
                      <div className="flex justify-evenly overflow-x-auto pb-2 scrollbar-hide">
                        {ICONS.map((iconObj) => {
                          const IconComponent = iconObj.icon;
                          return (
                            <button
                              key={iconObj.name}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  icon: iconObj.name,
                                })
                              }
                              className={`flex-shrink-0 w-12 h-12 my-4 ml-1.5 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                formData.icon === iconObj.name
                                  ? "bg-gray-900 text-white scale-105 shadow-md ring-2 ring-gray-900 ring-offset-2"
                                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-gray-900 hover:bg-gray-100 hover:scale-105"
                              }`}
                            >
                              <IconComponent
                                className="w-5 h-5"
                                strokeWidth={2}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Selection - Chip Style */}
                    <div>
                      <label className="text-base font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Category
                      </label>
                      <div className="flex justify-evenly flex-wrap">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.value}
                            onClick={() =>
                              setFormData({ ...formData, category: cat.value })
                            }
                            className={`px-3.5 py-2 rounded-full scale-105 text-xs font-medium transition-all duration-200 ${
                              formData.category === cat.value
                                ? "bg-gray-900 text-white shadow-md"
                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-900 hover:shadow-sm"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Section - Compact */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="block text-base font-semibold text-gray-900">
                      Frequency
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: "daily", label: "Daily", icon: Target },
                        { value: "weekly", label: "Weekly", icon: Calendar },
                        { value: "custom", label: "Custom", icon: Clock },
                      ].map((freq) => {
                        const FreqIcon = freq.icon;
                        return (
                          <button
                            key={freq.value}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                frequency: freq.value,
                                target_days:
                                  freq.value === "daily"
                                    ? [0, 1, 2, 3, 4, 5, 6]
                                    : formData.target_days,
                              });
                            }}
                            className={`flex-1 py-3 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                              formData.frequency === freq.value
                                ? "bg-gray-900 text-white"
                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-900"
                            }`}
                          >
                            <FreqIcon className="w-3.5 h-3.5" />
                            {freq.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Days of Week (if not daily) */}
                    {formData.frequency !== "daily" && (
                      <div className="pt-2">
                        <label className="block text-base font-semibold text-gray-900 mb-2">
                          Select Days
                        </label>
                        <div className="flex justify-evenly gap-1.5">
                          {DAYS_OF_WEEK.map((day, index) => (
                            <button
                              key={day}
                              onClick={() => {
                                const newDays = formData.target_days.includes(
                                  index,
                                )
                                  ? formData.target_days.filter(
                                      (d) => d !== index,
                                    )
                                  : [...formData.target_days, index];
                                setFormData({
                                  ...formData,
                                  target_days: newDays,
                                });
                              }}
                              className={`px-8 py-3 rounded-lg text-xs font-semibold transition-all ${
                                formData.target_days.includes(index)
                                  ? "bg-gray-900 text-white"
                                  : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-900"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Difficulty & Reminder - Compact Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    {/* Difficulty */}
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">
                        Difficulty
                      </label>
                      <div className="flex gap-1.5">
                        {[
                          { value: "easy", icon: "○" },
                          { value: "medium", icon: "◐" },
                          { value: "hard", icon: "●" },
                        ].map((diff) => (
                          <button
                            key={diff.value}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                difficulty: diff.value,
                              })
                            }
                            className={`flex-1 py-3 rounded-lg text-xs font-medium capitalize transition-all ${
                              formData.difficulty === diff.value
                                ? "bg-gray-900 text-white"
                                : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-900"
                            }`}
                          >
                            <span className="mr-1">{diff.icon}</span>
                            {diff.value}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reminder Toggle */}
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">
                        Reminder
                      </label>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            reminder_enabled: !formData.reminder_enabled,
                          })
                        }
                        className={`w-full py-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                          formData.reminder_enabled
                            ? "bg-gray-900 text-white"
                            : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-900"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {formData.reminder_enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  {/* Reminder Time (if enabled) */}
                  {formData.reminder_enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        value={formData.reminder_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reminder_time: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer Actions - Compact */}
              <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 flex gap-2.5">
                <button
                  onClick={() => {
                    showCreateModal && setShowCreateModal(false);
                    showEditModal && setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium text-gray-700"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                  onClick={
                    showCreateModal ? handleCreateHabit : handleUpdateHabit
                  }
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {showCreateModal ? "Creating..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {showCreateModal ? "Create" : "Update"}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDeleteModal(false);
              setHabitToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete Habit
                    </h3>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    "{habitToDelete?.title}"
                  </span>
                  ? All progress, streaks, and data associated with this habit
                  will be permanently removed.
                </p>

                {habitToDelete && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="capitalize">
                        {habitToDelete.category}
                      </span>
                      {habitToDelete.current_streak > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{habitToDelete.current_streak} day streak</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setHabitToDelete(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                  onClick={handleDeleteHabit}
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Habit</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
