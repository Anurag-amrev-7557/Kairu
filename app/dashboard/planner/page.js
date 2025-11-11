"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Grid3x3,
  List,
  X,
  CheckCircle,
  Circle,
  MoreVertical,
  CalendarDays,
  Target,
} from "lucide-react";
import { useSession } from "next-auth/react";
import useTaskStore from "../../../lib/store/taskStore";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
  isToday as isTodayFn,
} from "date-fns";

export default function PlannerPage() {
  const { data: session } = useSession();
  const { tasks, fetchTasks, updateTask, deleteTask, createTask } =
    useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("timeline");
  const [draggedTask, setDraggedTask] = useState(null);
  const [addingTaskAtHour, setAddingTaskAtHour] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingUnscheduledTask, setAddingUnscheduledTask] = useState(false);
  const [newUnscheduledTaskTitle, setNewUnscheduledTaskTitle] = useState("");

  useEffect(() => {
    if (session?.user?.token) {
      fetchTasks({}, session.user.token);
    }
  }, [session, fetchTasks]);

  const CALENDAR_DAYS_COUNT = 14; // Number of days to show in the calendar
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: CALENDAR_DAYS_COUNT }, (_, i) =>
    addDays(weekStart, i),
  );

  const workingHours = Array.from({ length: 18 }, (_, i) => ({
    hour: i + 6,
    label: format(new Date().setHours(i + 6, 0, 0, 0), "h a"),
  }));

  const getTimePeriod = (hour) => {
    if (hour >= 6 && hour < 12)
      return {
        name: "Morning",
        color: "bg-amber-50",
        textColor: "text-amber-700",
      };
    if (hour >= 12 && hour < 17)
      return {
        name: "Afternoon",
        color: "bg-blue-50",
        textColor: "text-blue-700",
      };
    if (hour >= 17 && hour < 21)
      return {
        name: "Evening",
        color: "bg-purple-50",
        textColor: "text-purple-700",
      };
    return {
      name: "Night",
      color: "bg-indigo-50",
      textColor: "text-indigo-700",
    };
  };

  const tasksForDay = tasks.filter((task) => {
    if (!task.scheduled_date) return false;
    try {
      const taskDate = parseISO(task.scheduled_date);
      return isSameDay(taskDate, selectedDate);
    } catch {
      return false;
    }
  });

  const unscheduledTasks = tasks.filter(
    (t) => !t.scheduled_date && t.status !== "completed",
  );

  const goToPreviousDay = () => setSelectedDate(addDays(selectedDate, -1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  const isToday = isTodayFn(selectedDate);

  const completedToday = tasksForDay.filter(
    (t) => t.status === "completed",
  ).length;
  const totalToday = tasksForDay.length;
  const totalDuration = tasksForDay.reduce(
    (acc, t) => acc + (t.estimated_duration || 0),
    0,
  );

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (hour) => {
    if (!draggedTask || !session?.user?.token) return;

    try {
      // Create scheduled datetime for the selected hour
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hour, 0, 0, 0);

      await updateTask(
        draggedTask._id,
        {
          scheduled_date: scheduledDateTime.toISOString(),
          scheduled_time: `${hour}:00`,
        },
        session.user.token,
      );

      setDraggedTask(null);
    } catch (error) {
      console.error("Failed to schedule task:", error);
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (task) => {
    if (!session?.user?.token) return;

    try {
      await updateTask(
        task._id,
        {
          status: task.status === "completed" ? "todo" : "completed",
        },
        session.user.token,
      );
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!session?.user?.token) return;

    try {
      await deleteTask(taskId, session.user.token);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Get tasks for a specific hour
  const getTasksForHour = (hour) => {
    return tasksForDay.filter((task) => {
      if (!task.scheduled_time) return false;
      const taskHour = parseInt(task.scheduled_time.split(":")[0]);
      return taskHour === hour;
    });
  };

  // Add new task at specific time
  const handleAddTaskAtTime = async (hour) => {
    if (!newTaskTitle.trim() || !session?.user?.token) return;

    // Close modal immediately for better UX
    const taskTitle = newTaskTitle.trim();
    setNewTaskTitle("");
    setAddingTaskAtHour(null);

    try {
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hour, 0, 0, 0);

      await createTask(
        {
          title: taskTitle,
          scheduled_date: scheduledDateTime.toISOString(),
          scheduled_time: `${hour}:00`,
          status: "todo",
          priority: "not_urgent_not_important",
          category: "Work",
        },
        session.user.token,
      );
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  // Add new unscheduled task
  const handleAddUnscheduledTask = async () => {
    if (!newUnscheduledTaskTitle.trim() || !session?.user?.token) return;

    // Close modal immediately for better UX
    const taskTitle = newUnscheduledTaskTitle.trim();
    setNewUnscheduledTaskTitle("");
    setAddingUnscheduledTask(false);

    try {
      await createTask(
        {
          title: taskTitle,
          status: "todo",
          priority: "not_urgent_not_important",
          category: "Work",
        },
        session.user.token,
      );
    } catch (error) {
      console.error("Failed to create unscheduled task:", error);
    }
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50">
      <div className="h-full flex flex-col">
        {/* Compact Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="max-w-[1920px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              {/* Title & Date Nav */}
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Daily Planner
                  </h1>
                  <p className="text-xs text-gray-500">Organize your day</p>
                </div>

                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                  <button
                    onClick={goToPreviousDay}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="px-3 min-w-[160px] text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {format(selectedDate, "EEE, MMM d")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(selectedDate, "yyyy")}
                    </div>
                  </div>

                  <button
                    onClick={goToNextDay}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>

                  {!isToday && (
                    <button
                      onClick={goToToday}
                      className="ml-1 px-3 py-1.5 bg-black scale-110 text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
                    >
                      Today
                    </button>
                  )}
                </div>
              </div>

              {/* Stats & View Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Done</div>
                      <div className="text-sm font-bold text-gray-900">
                        {completedToday}/{totalToday}
                      </div>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-gray-300"></div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Time</div>
                      <div className="text-sm font-bold text-gray-900">
                        {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                      </div>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-gray-300"></div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Score</div>
                      <div className="text-sm font-bold text-gray-900">
                        {totalToday > 0
                          ? Math.round((completedToday / totalToday) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex bg-gray-100 rounded-full p-0.5 scale-120 ml-2">
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`relative px-3 py-1.5 rounded-full transition-all ${viewMode === "timeline" ? "text-white" : "text-gray-600"}`}
                  >
                    {viewMode === "timeline" && (
                      <motion.div
                        layoutId="viewBg"
                        className="absolute inset-0 bg-black rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <div className="flex items-center gap-1.5 relative z-10">
                      <Grid3x3 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Timeline</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("schedule")}
                    className={`relative px-3 py-1.5 rounded transition-all ${viewMode === "schedule" ? "text-white" : "text-gray-600"}`}
                  >
                    {viewMode === "schedule" && (
                      <motion.div
                        layoutId="viewBg"
                        className="absolute inset-0 bg-black rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <div className="flex items-center gap-1.5 relative z-10">
                      <List className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Schedule</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Compact Week Calendar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newDate = addDays(weekStart, -CALENDAR_DAYS_COUNT);
                  setSelectedDate(newDate);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>

              <div className="flex gap-1 flex-1">
                {weekDays.map((day, idx) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isDayToday = isTodayFn(day);
                  const tasksCount = tasks.filter((t) => {
                    if (!t.scheduled_date) return false;
                    try {
                      return isSameDay(parseISO(t.scheduled_date), day);
                    } catch {
                      return false;
                    }
                  }).length;

                  const completedCount = tasks.filter((t) => {
                    if (!t.scheduled_date || t.status !== "completed")
                      return false;
                    try {
                      return isSameDay(parseISO(t.scheduled_date), day);
                    } catch {
                      return false;
                    }
                  }).length;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <motion.button
                        onClick={() => setSelectedDate(day)}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative w-full flex items-center justify-center gap-2 py-2 px-1 rounded-full transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-black to-gray-800 text-white shadow-md"
                            : isDayToday
                              ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border border-blue-300"
                              : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-600"
                        }`}
                      >
                        {/* Date Number */}
                        <span
                          className={`text-sm font-bold ${
                            isSelected
                              ? "text-white"
                              : isDayToday
                                ? "text-blue-700"
                                : "text-gray-900"
                          }`}
                        >
                          {format(day, "d")}
                        </span>

                        {/* Day Label */}
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isSelected
                              ? "text-white/80"
                              : isDayToday
                                ? "text-blue-600"
                                : "text-gray-500"
                          }`}
                        >
                          {format(day, "EEE")}
                        </span>

                        {/* Task Count Badge */}
                        {tasksCount > 0 && (
                          <div
                            className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-white/20"
                                : isDayToday
                                  ? "bg-blue-200/50"
                                  : "bg-gray-100"
                            }`}
                          >
                            <span
                              className={`text-[8px] font-semibold ${
                                isSelected
                                  ? "text-white"
                                  : isDayToday
                                    ? "text-blue-700"
                                    : "text-gray-700"
                              }`}
                            >
                              {completedCount}/{tasksCount}
                            </span>
                          </div>
                        )}

                        {/* Today Indicator Dot */}
                        {isDayToday && !isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-0.5 right-0.5 w-1 h-1 bg-blue-500 rounded-full"
                          />
                        )}
                      </motion.button>

                      {/* Progress Bar Below Pill */}
                      {tasksCount > 0 && (
                        <div className="w-full px-1">
                          <div className="w-full h-0.5 rounded-full overflow-hidden bg-black/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${tasksCount > 0 ? (completedCount / tasksCount) * 100 : 0}%`,
                              }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className={`h-full ${
                                isSelected
                                  ? "bg-black"
                                  : isDayToday
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const newDate = addDays(weekStart, CALENDAR_DAYS_COUNT);
                  setSelectedDate(newDate);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1920px] mx-auto px-6 py-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Timeline */}
              <div className="col-span-9">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {viewMode === "timeline" ? (
                    <div className="p-4">
                      <div className="space-y-0">
                        {workingHours.map(({ hour, label }, idx) => {
                          const period = getTimePeriod(hour);
                          const isPeriodStart =
                            idx === 0 ||
                            getTimePeriod(workingHours[idx - 1].hour).name !==
                              period.name;

                          return (
                            <div key={hour}>
                              {isPeriodStart && (
                                <div
                                  className={`flex items-center gap-2 py-1.5 px-3 ${period.color} rounded-lg mb-1.5 mt-3`}
                                >
                                  <span
                                    className={`text-xs font-semibold uppercase ${period.textColor}`}
                                  >
                                    {period.name}
                                  </span>
                                  <div className="flex-1 h-px bg-gray-300"></div>
                                </div>
                              )}

                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.01 }}
                                className="group flex items-stretch rounded-lg transition-colors"
                              >
                                <div className="flex-shrink-0 w-20 py-3 pl-3 flex items-start">
                                  <span className="text-xs font-medium text-gray-500">
                                    {label}
                                  </span>
                                </div>

                                <div
                                  className="flex-1 relative py-3 pr-3"
                                  onDragOver={handleDragOver}
                                  onDrop={() => handleDrop(hour)}
                                >
                                  {getTasksForHour(hour).length > 0 ||
                                  addingTaskAtHour === hour ? (
                                    <div className="space-y-2">
                                      <AnimatePresence mode="sync">
                                        {getTasksForHour(hour).map(
                                          (task, taskIndex) => {
                                            const priorityStyles = {
                                              urgent_important:
                                                "border-l-red-500 bg-red-50/50",
                                              urgent_not_important:
                                                "border-l-orange-500 bg-orange-50/50",
                                              not_urgent_important:
                                                "border-l-yellow-500 bg-yellow-50/50",
                                              not_urgent_not_important:
                                                "border-l-gray-300 bg-white",
                                            };

                                            // Use a stable key to prevent re-animation when optimistic update is replaced by real task
                                            const stableKey =
                                              task._id?.startsWith("temp_")
                                                ? `${hour}-${task.title}-${taskIndex}`
                                                : task._id;

                                            return (
                                              <motion.div
                                                key={stableKey}
                                                initial={{
                                                  opacity: 0,
                                                  scale: 0.96,
                                                  y: 15,
                                                }}
                                                animate={{
                                                  opacity: 1,
                                                  scale: 1,
                                                  y: 0,
                                                }}
                                                exit={{
                                                  opacity: 0,
                                                  scale: 0.96,
                                                  x: -20,
                                                  transition: {
                                                    duration: 0.15,
                                                    ease: [0.4, 0, 0.2, 1],
                                                  },
                                                }}
                                                transition={{
                                                  duration: 0.25,
                                                  ease: [0.25, 0.1, 0.25, 1],
                                                }}
                                                className={`px-3 py-3 border-l-3 border border-gray-400 rounded-md hover:bg-gray-50 transition-all duration-150 group/task bg-white ${
                                                  task.priority ===
                                                  "urgent_important"
                                                    ? "border-l-red-400"
                                                    : task.priority ===
                                                        "urgent_not_important"
                                                      ? "border-l-orange-400"
                                                      : task.priority ===
                                                          "not_urgent_important"
                                                        ? "border-l-yellow-400"
                                                        : "border-l-gray-300"
                                                } ${
                                                  task.status === "completed"
                                                    ? "opacity-50"
                                                    : ""
                                                }`}
                                              >
                                                <div className="flex items-start gap-3">
                                                  <button
                                                    onClick={() =>
                                                      handleToggleComplete(task)
                                                    }
                                                    className="flex-shrink-0 mt-0.5"
                                                  >
                                                    {task.status ===
                                                    "completed" ? (
                                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                      <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                                    )}
                                                  </button>
                                                  <div className="flex-1 min-w-0">
                                                    <h4
                                                      className={`text-sm font-medium ${
                                                        task.status ===
                                                        "completed"
                                                          ? "text-gray-400 line-through"
                                                          : "text-gray-900"
                                                      }`}
                                                    >
                                                      {task.title}
                                                    </h4>
                                                    {task.description && (
                                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {task.description}
                                                      </p>
                                                    )}
                                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                      {task.estimated_duration && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-600 px-2 py-0.5 rounded bg-gray-50">
                                                          <Clock className="w-3 h-3" />
                                                          <span>
                                                            {
                                                              task.estimated_duration
                                                            }
                                                            m
                                                          </span>
                                                        </div>
                                                      )}
                                                      {task.category && (
                                                        <span className="text-xs text-gray-600 px-2 py-0.5 rounded bg-blue-50">
                                                          {task.category}
                                                        </span>
                                                      )}
                                                      {task.priority && (
                                                        <span
                                                          className={`text-xs px-2 py-0.5 rounded ${
                                                            task.priority ===
                                                            "urgent_important"
                                                              ? "bg-red-50 text-red-700"
                                                              : task.priority ===
                                                                  "urgent_not_important"
                                                                ? "bg-orange-50 text-orange-700"
                                                                : task.priority ===
                                                                    "not_urgent_important"
                                                                  ? "bg-yellow-50 text-yellow-700"
                                                                  : "bg-gray-100 text-gray-600"
                                                          }`}
                                                        >
                                                          {task.priority
                                                            .split("_")
                                                            .map(
                                                              (w) =>
                                                                w
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                                w.slice(1),
                                                            )
                                                            .join(" ")}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <button
                                                    onClick={() =>
                                                      handleDeleteTask(task._id)
                                                    }
                                                    className="opacity-0 group-hover/task:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                                                  >
                                                    <X className="w-4 h-4 text-gray-400" />
                                                  </button>
                                                </div>
                                              </motion.div>
                                            );
                                          },
                                        )}
                                      </AnimatePresence>
                                      <AnimatePresence mode="popLayout">
                                        {addingTaskAtHour === hour && (
                                          <motion.div
                                            initial={{
                                              opacity: 0,
                                              scale: 0.8,
                                              y: 20,
                                              rotateX: -15,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              scale: 1,
                                              y: 0,
                                              rotateX: 0,
                                            }}
                                            exit={{
                                              opacity: 0,
                                              scale: 0.85,
                                              y: -15,
                                              rotateX: 15,
                                              transition: { duration: 0.15 },
                                            }}
                                            transition={{
                                              type: "spring",
                                              stiffness: 350,
                                              damping: 22,
                                              mass: 0.8,
                                            }}
                                            className="p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-400 rounded-xl shadow-xl backdrop-blur-sm"
                                            style={{ perspective: "1000px" }}
                                          >
                                            <input
                                              type="text"
                                              value={newTaskTitle}
                                              onChange={(e) =>
                                                setNewTaskTitle(e.target.value)
                                              }
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleAddTaskAtTime(hour);
                                                } else if (e.key === "Escape") {
                                                  setAddingTaskAtHour(null);
                                                  setNewTaskTitle("");
                                                }
                                              }}
                                              placeholder="Task title..."
                                              autoFocus
                                              className="w-full text-sm border-none outline-none bg-transparent placeholder:text-gray-400"
                                            />
                                            <div className="flex gap-2 mt-2">
                                              <motion.button
                                                onClick={() =>
                                                  handleAddTaskAtTime(hour)
                                                }
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="px-3 py-1 scale-110 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm"
                                              >
                                                Add
                                              </motion.button>
                                              <motion.button
                                                onClick={() => {
                                                  setAddingTaskAtHour(null);
                                                  setNewTaskTitle("");
                                                }}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="px-3 py-1 scale-110 bg-gray-100 text-gray-700 rounded-full text-xs font-medium transition-colors"
                                              >
                                                Cancel
                                              </motion.button>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => setAddingTaskAtHour(hour)}
                                      className={`h-full min-h-[60px] border-2 border-dashed rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                                        draggedTask
                                          ? "border-blue-400 bg-blue-50"
                                          : "border-gray-200 hover:border-black"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                          {draggedTask
                                            ? "Drop here"
                                            : "Add task"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      {tasksForDay.length === 0 ? (
                        <div className="text-center py-16">
                          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-base font-semibold text-gray-600 mb-1">
                            No tasks scheduled
                          </h3>
                          <p className="text-sm text-gray-500">
                            Drag tasks from the sidebar
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tasksForDay.map((task) => (
                            <motion.div
                              key={task._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group"
                            >
                              <button
                                onClick={() => handleToggleComplete(task)}
                                className="flex-shrink-0"
                              >
                                {task.status === "completed" ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`text-sm font-medium ${task.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"}`}
                                >
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {task.estimated_duration && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.estimated_duration}m</span>
                                  </div>
                                )}

                                {task.category && (
                                  <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 border border-gray-200">
                                    {task.category}
                                  </span>
                                )}

                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded"
                                >
                                  <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-span-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                        <CalendarDays className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Unscheduled
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        {unscheduledTasks.length}
                      </span>
                      <button
                        onClick={() => setAddingUnscheduledTask(true)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Add unscheduled task"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">Drag to schedule</p>

                  {addingUnscheduledTask && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-2.5 bg-blue-50 border-2 border-blue-400 rounded-lg"
                    >
                      <input
                        type="text"
                        value={newUnscheduledTaskTitle}
                        onChange={(e) =>
                          setNewUnscheduledTaskTitle(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddUnscheduledTask();
                          } else if (e.key === "Escape") {
                            setAddingUnscheduledTask(false);
                            setNewUnscheduledTaskTitle("");
                          }
                        }}
                        placeholder="Task title..."
                        autoFocus
                        className="w-full text-xs border-none outline-none bg-transparent placeholder:text-gray-400 mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddUnscheduledTask}
                          className="px-2 py-1 bg-black text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingUnscheduledTask(false);
                            setNewUnscheduledTaskTitle("");
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {unscheduledTasks.length === 0 ? (
                      <div className="text-center py-6">
                        <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">All scheduled!</p>
                      </div>
                    ) : (
                      unscheduledTasks.map((task) => {
                        const priorityColors = {
                          urgent_important: "border-red-200 bg-red-50",
                          urgent_not_important:
                            "border-orange-200 bg-orange-50",
                          not_urgent_important:
                            "border-yellow-200 bg-yellow-50",
                          not_urgent_not_important:
                            "border-gray-200 bg-gray-50",
                        };

                        return (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-2.5 rounded-lg border-l-3 ${priorityColors[task.priority] || priorityColors.not_urgent_not_important} hover:shadow-sm transition-all group`}
                          >
                            <div className="flex items-start gap-2 mb-1.5">
                              <button
                                onClick={() => handleToggleComplete(task)}
                                className="flex-shrink-0 mt-0.5"
                              >
                                {task.status === "completed" ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                              <h4
                                className={`text-xs font-medium line-clamp-2 flex-1 cursor-move ${
                                  task.status === "completed"
                                    ? "text-gray-400 line-through"
                                    : "text-gray-900"
                                }`}
                                draggable
                                onDragStart={() => handleDragStart(task)}
                                onDragEnd={() => setDraggedTask(null)}
                              >
                                {task.title}
                              </h4>
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 rounded flex-shrink-0"
                              >
                                <MoreVertical className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {task.estimated_duration && (
                                <div className="flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.estimated_duration}m</span>
                                </div>
                              )}
                              {task.category && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-600 text-xs">
                                    {task.category}
                                  </span>
                                </>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
