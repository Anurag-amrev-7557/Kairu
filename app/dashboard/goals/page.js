"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Flame,
  Trophy,
  Star,
  Zap,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  Pause,
  Award,
  ArrowRight,
  Sparkles,
  Flag,
  Rocket,
  Brain,
  Heart,
  Dumbbell,
  BookOpen,
  Briefcase,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const GOAL_TYPES = [
  { value: "focus_hours", label: "Focus Hours", icon: Clock, color: "#1f2937" },
  {
    value: "tasks_completed",
    label: "Tasks Completed",
    icon: CheckCircle2,
    color: "#374151",
  },
  { value: "streak", label: "Streak", icon: Flame, color: "#4b5563" },
  { value: "skill", label: "Skill Development", icon: Brain, color: "#111827" },
  { value: "habit", label: "Habit Building", icon: Rocket, color: "#000000" },
  { value: "custom", label: "Custom Goal", icon: Target, color: "#374151" },
];

const TIME_FRAMES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const GOAL_ICONS = [
  { icon: Target, name: "target" },
  { icon: Trophy, name: "trophy" },
  { icon: Rocket, name: "rocket" },
  { icon: Flag, name: "flag" },
  { icon: Star, name: "star" },
  { icon: Zap, name: "zap" },
  { icon: Brain, name: "brain" },
  { icon: Heart, name: "heart" },
  { icon: Dumbbell, name: "dumbbell" },
  { icon: BookOpen, name: "book" },
  { icon: Briefcase, name: "briefcase" },
  { icon: DollarSign, name: "dollar" },
];

export default function GoalsPage() {
  const { data: session } = useSession();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState("active");
  const [expandedGoals, setExpandedGoals] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "custom",
    target_value: "",
    target_unit: "hours",
    time_frame: "monthly",
    deadline: "",
    motivation_note: "",
    why: "",
    icon: "target",
  });

  useEffect(() => {
    if (session?.user?.token) {
      loadGoals();
    }
  }, [session]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch("/api/goals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load goals");
      }

      setGoals(data.goals || []);
    } catch (error) {
      console.error("Error loading goals:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to load goals",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Please enter a goal title" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          target_metric: {
            value: parseFloat(formData.target_value) || 0,
            unit: formData.target_unit,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create goal");
      }

      setMessage({ type: "success", text: "Goal created successfully!" });
      setShowCreateModal(false);
      resetForm();
      loadGoals();
    } catch (error) {
      console.error("Error creating goal:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to create goal",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGoal = async () => {
    if (!selectedGoal || !formData.title.trim()) {
      setMessage({ type: "error", text: "Please enter a goal title" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch(`/api/goals/${selectedGoal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          target_metric: {
            value: parseFloat(formData.target_value) || 0,
            unit: formData.target_unit,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update goal");
      }

      setMessage({ type: "success", text: "Goal updated successfully!" });
      setShowEditModal(false);
      setSelectedGoal(null);
      resetForm();
      loadGoals();
    } catch (error) {
      console.error("Error updating goal:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update goal",
      });
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch(`/api/goals/${goalToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete goal");
      }

      setMessage({ type: "success", text: "Goal deleted successfully!" });
      setShowDeleteModal(false);
      setGoalToDelete(null);
      loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to delete goal",
      });
      setShowDeleteModal(false);
      setGoalToDelete(null);
    }
  };

  const handleToggleStatus = async (goalId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";

    // Optimistically update the UI
    setGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goal._id === goalId ? { ...goal, status: newStatus } : goal,
      ),
    );

    try {
      const token = session?.user?.token;

      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert on error
        setGoals((prevGoals) =>
          prevGoals.map((goal) =>
            goal._id === goalId ? { ...goal, status: currentStatus } : goal,
          ),
        );
        throw new Error(data.error || "Failed to update goal status");
      }

      setMessage({
        type: "success",
        text: `Goal ${newStatus === "active" ? "activated" : "paused"}!`,
      });
    } catch (error) {
      console.error("Error updating goal status:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update goal status",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "custom",
      target_value: "",
      target_unit: "hours",
      time_frame: "monthly",
      deadline: "",
      motivation_note: "",
      why: "",
      icon: "target",
    });
  };

  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title || "",
      description: goal.description || "",
      type: goal.type || "custom",
      target_value: goal.target_metric?.value?.toString() || "",
      target_unit: goal.target_metric?.unit || "hours",
      time_frame: goal.time_frame || "monthly",
      deadline: goal.deadline
        ? new Date(goal.deadline).toISOString().split("T")[0]
        : "",
      motivation_note: goal.motivation_note || "",
      why: goal.why || "",
      icon: goal.icon || "target",
    });
    setShowEditModal(true);
  };

  const toggleGoalExpanded = (goalId) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const filteredGoals = goals.filter((goal) => {
    if (filterStatus === "all") return true;
    return goal.status === filterStatus;
  });

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === "active").length,
    completed: goals.filter((g) => g.status === "completed").length,
    progress:
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) /
              goals.length,
          )
        : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Your Goals
            </h1>
            <p className="text-gray-600 mt-2">
              Track your progress and achieve your dreams
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-gray-800 to-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create Goal</span>
          </motion.button>
        </div>

        {/* Filter Tabs and Stats */}
        <div className="flex items-center justify-between gap-6 mb-6">
          {/* Filter Tabs - Analytics Style */}
          <div className="flex bg-gray-100 rounded-full p-1.5">
            {["all", "active", "paused", "completed"].map((status) => {
              const isActive = filterStatus === status;
              return (
                <motion.button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative px-4 py-1.5 rounded-full transition-colors ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 bg-black/90 rounded-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                        mass: 0.8,
                      }}
                    />
                  )}
                  <span className="text-sm font-medium relative z-10">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Compact Stats Bar - Kanban Style */}
          <div className="flex items-center gap-6 bg-white rounded-full px-6 py-2.5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black"></div>
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-semibold text-black">
                {stats.total}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-900"></div>
              <span className="text-xs text-gray-500">Active</span>
              <span className="text-sm font-semibold text-black">
                {stats.active}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-700"></div>
              <span className="text-xs text-gray-500">Done</span>
              <span className="text-sm font-semibold text-black">
                {stats.completed}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-sm font-semibold text-black">
                {stats.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.95,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              mass: 0.5,
            }}
            className="max-w-7xl mx-auto mb-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
                message.type === "success"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-900 border border-gray-200"
              }`}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: 0.15,
                }}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
              </motion.div>
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <div className="max-w-7xl mx-auto">
        {filteredGoals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first goal to start tracking your progress
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-gray-800 to-black text-white px-5 py-2.5 rounded-lg inline-flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                Create Your First Goal
              </span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredGoals.map((goal, index) => {
              const GoalIcon =
                GOAL_ICONS.find((i) => i.name === goal.icon)?.icon || Target;
              const typeInfo = GOAL_TYPES.find((t) => t.value === goal.type);
              const isExpanded = expandedGoals.has(goal._id);

              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    ease: [0.4, 0.0, 0.2, 1],
                  }}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Icon + Content */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Compact Icon */}
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <GoalIcon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title and Status Row */}
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {goal.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide flex-shrink-0 ${
                                goal.status === "active"
                                  ? "bg-gray-900 text-white"
                                  : goal.status === "completed"
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {goal.status}
                            </span>
                          </div>

                          {/* Meta Info Row */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {goal.time_frame}
                            </span>
                            {goal.deadline && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                              </>
                            )}
                            {goal.target_metric?.value && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                  <Flag className="w-3 h-3" />
                                  {goal.target_metric.value}{" "}
                                  {goal.target_metric.unit}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Center: Compact Progress */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${goal.progress_percentage || 0}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: index * 0.05,
                                ease: [0.4, 0.0, 0.2, 1],
                              }}
                              className="h-full rounded-full bg-gray-900"
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 w-10 text-right">
                            {goal.progress_percentage || 0}%
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() =>
                            handleToggleStatus(goal._id, goal.status)
                          }
                          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                          title={
                            goal.status === "active"
                              ? "Pause goal"
                              : "Activate goal"
                          }
                        >
                          {goal.status === "active" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(goal)}
                          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit goal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(goal)}
                          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleGoalExpanded(goal._id)}
                          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                          title="Show details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          transition={{
                            height: {
                              duration: 0.4,
                              ease: [0.4, 0.0, 0.2, 1],
                            },
                            opacity: {
                              duration: 0.25,
                              ease: [0.4, 0.0, 0.2, 1],
                            },
                          }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {goal.motivation_note && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    Motivation
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    {goal.motivation_note}
                                  </p>
                                </div>
                              )}
                              {goal.why && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-red-500" />
                                    Why This Matters
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    {goal.why}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Milestones */}
                            {goal.milestones && goal.milestones.length > 0 && (
                              <div className="mt-6">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Flag className="w-4 h-4 text-orange-500" />
                                  Milestones
                                </h4>
                                <div className="space-y-2">
                                  {goal.milestones.map((milestone, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex items-center gap-3 p-3 rounded-lg ${
                                        milestone.completed
                                          ? "bg-gray-900 text-white"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      {milestone.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-gray-400" />
                                      )}
                                      <div className="flex-1">
                                        <p
                                          className={`text-sm font-medium ${
                                            milestone.completed
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {milestone.title}
                                        </p>
                                        <p
                                          className={`text-xs ${milestone.completed ? "text-gray-300" : "text-gray-500"}`}
                                        >
                                          Target: {milestone.target_value}{" "}
                                          {goal.target_metric?.unit}
                                        </p>
                                      </div>
                                      {milestone.reward && (
                                        <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded-full">
                                          {milestone.reward}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Create New Goal
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Complete 50 focus hours this month"
                    className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your goal..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Goal Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GOAL_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() =>
                            setFormData({ ...formData, type: type.value })
                          }
                          className={`p-3 rounded-lg flex gap-4 items-center border-2 transition-all text-left ${
                            formData.type === type.value
                              ? "border-gray-900 bg-gray-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: type.color }}
                          />
                          <p className="text-sm font-medium text-gray-900">
                            {type.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={formData.target_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_value: e.target.value,
                        })
                      }
                      placeholder="50"
                      className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={formData.target_unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_unit: e.target.value,
                        })
                      }
                      placeholder="hours"
                      className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Time Frame & Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Frame
                    </label>
                    <select
                      value={formData.time_frame}
                      onChange={(e) =>
                        setFormData({ ...formData, time_frame: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    >
                      {TIME_FRAMES.map((frame) => (
                        <option key={frame.value} value={frame.value}>
                          {frame.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Motivation Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivation Note
                  </label>
                  <textarea
                    value={formData.motivation_note}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        motivation_note: e.target.value,
                      })
                    }
                    placeholder="What motivates you to achieve this goal?"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Why */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why This Matters
                  </label>
                  <textarea
                    value={formData.why}
                    onChange={(e) =>
                      setFormData({ ...formData, why: e.target.value })
                    }
                    placeholder="Why is this goal important to you?"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {GOAL_ICONS.map((iconItem) => {
                      const Icon = iconItem.icon;
                      return (
                        <button
                          key={iconItem.name}
                          onClick={() =>
                            setFormData({ ...formData, icon: iconItem.name })
                          }
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.icon === iconItem.name
                              ? "border-gray-900 bg-black/80 text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto" strokeWidth={1.5} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                  onClick={handleCreateGoal}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" strokeWidth={1} />
                      <span>Create Goal</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Goal Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setSelectedGoal(null);
              resetForm();
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                  Edit Goal
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedGoal(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Same form fields as create modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Complete 50 focus hours this month"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your goal..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={formData.target_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_value: e.target.value,
                        })
                      }
                      placeholder="50"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={formData.target_unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_unit: e.target.value,
                        })
                      }
                      placeholder="hours"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Frame
                    </label>
                    <select
                      value={formData.time_frame}
                      onChange={(e) =>
                        setFormData({ ...formData, time_frame: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    >
                      {TIME_FRAMES.map((frame) => (
                        <option key={frame.value} value={frame.value}>
                          {frame.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivation Note
                  </label>
                  <textarea
                    value={formData.motivation_note}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        motivation_note: e.target.value,
                      })
                    }
                    placeholder="What motivates you to achieve this goal?"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why This Matters
                  </label>
                  <textarea
                    value={formData.why}
                    onChange={(e) =>
                      setFormData({ ...formData, why: e.target.value })
                    }
                    placeholder="Why is this goal important to you?"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedGoal(null);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                  onClick={handleUpdateGoal}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Update Goal</span>
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
              setGoalToDelete(null);
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
                      Delete Goal
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
                    "{goalToDelete?.title}"
                  </span>
                  ? All progress and data associated with this goal will be
                  permanently removed.
                </p>

                {goalToDelete && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{goalToDelete.time_frame}</span>
                      {goalToDelete.progress_percentage !== undefined && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>
                            {goalToDelete.progress_percentage}% complete
                          </span>
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
                    setGoalToDelete(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                  onClick={handleDeleteGoal}
                  className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Goal</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
