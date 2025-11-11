"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MoreVertical,
  GripVertical,
  Search,
  Filter,
  Calendar,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import useTaskStore from "../../../lib/store/taskStore";
import { useSession } from "next-auth/react";

const INITIAL_COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-gray-500",
    tasks: [],
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-500",
    tasks: [],
  },
  {
    id: "review",
    title: "Review",
    color: "bg-yellow-500",
    tasks: [],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-500",
    tasks: [],
  },
];

export default function KanbanPage() {
  const { tasks, fetchTasks, updateTask } = useTaskStore();
  const { data: session } = useSession();
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (session?.user?.token) {
      fetchTasks({}, session.user.token);
    }
  }, [session, fetchTasks]);

  useEffect(() => {
    // Organize tasks into columns whenever tasks or searchQuery changes
    const filteredTasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    const updatedColumns = INITIAL_COLUMNS.map((column) => {
      let columnTasks = [];

      if (column.id === "todo") {
        // Map to 'todo' and 'backlog' status from database
        columnTasks = filteredTasks.filter(
          (task) => task.status === "todo" || task.status === "backlog",
        );
      } else if (column.id === "in-progress") {
        // Map to 'in_progress' status (with underscore) from database
        columnTasks = filteredTasks.filter(
          (task) => task.status === "in_progress",
        );
      } else if (column.id === "review") {
        // Map to 'blocked' status from database (closest match for review)
        columnTasks = filteredTasks.filter((task) => task.status === "blocked");
      } else if (column.id === "done") {
        // Map to 'completed' status from database
        columnTasks = filteredTasks.filter(
          (task) => task.status === "completed",
        );
      }

      return { ...column, tasks: columnTasks };
    });

    setColumns(updatedColumns);
  }, [tasks, searchQuery]);

  const handleDragStart = (task, columnId) => {
    setDraggedTask({ task, sourceColumnId: columnId });
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();

    if (!draggedTask || !session?.user?.token) return;

    const { task, sourceColumnId } = draggedTask;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      setDraggedOverColumn(null);
      return;
    }

    // Map Kanban column IDs to database status values
    let updates = {};
    if (targetColumnId === "done") {
      updates = { status: "completed" };
    } else if (targetColumnId === "todo") {
      updates = { status: "todo" };
    } else if (targetColumnId === "in-progress") {
      updates = { status: "in_progress" };
    } else if (targetColumnId === "review") {
      updates = { status: "blocked" };
    }

    updateTask(task._id, updates, session.user.token);

    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  // Map database priority values to UI display
  const mapPriorityToUI = (dbPriority) => {
    const priorityMap = {
      urgent_important: "high",
      urgent_not_important: "medium",
      not_urgent_important: "medium",
      not_urgent_not_important: "low",
    };
    return priorityMap[dbPriority] || "low";
  };

  const getPriorityColor = (priority) => {
    const uiPriority = mapPriorityToUI(priority);
    switch (uiPriority) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const getPriorityDotColor = (priority) => {
    const uiPriority = mapPriorityToUI(priority);
    switch (uiPriority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  const getOverdueDays = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isOverdue = (dueDate) => {
    const days = getOverdueDays(dueDate);
    return days !== null && days < 0;
  };

  const openDetailModal = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "cancelled" &&
      isOverdue(t.deadline),
  ).length;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Kanban Board
              </h1>
              <p className="text-gray-600">
                Organize your tasks with drag and drop
              </p>
            </div>
          </div>

          <div className="flex flex-1 w-full justify-between items-center gap-6">
            {/* Search Bar */}
            <div className="relative w-full flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
              />
            </div>
            {/* Compact Stats Bar */}
            <div className="flex items-center gap-6 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-sm font-semibold text-black">
                  {totalTasks}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">Done</span>
                <span className="text-sm font-semibold text-black">
                  {completedTasks}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-500">Active</span>
                <span className="text-sm font-semibold text-black">
                  {inProgressTasks}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-500">Overdue</span>
                <span className="text-sm font-semibold text-black">
                  {overdueTasks}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column, columnIndex) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: columnIndex * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="flex flex-col h-[calc(100vh-190px)] min-h-[600px]"
              layoutScroll
            >
              {/* Column Header */}
              <div className="roundedt-t-2xl px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${column.color}`}
                    ></div>
                    <h3 className="font-semibold text-black text-sm">
                      {column.title}
                    </h3>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <div
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex-1 rounded-2xl p-3 space-y-3 overflow-y-auto transition-all duration-300 ease-in-out ${
                  draggedOverColumn === column.id
                    ? "bg-gray-100 ring-1 ring-black/50 ring-inset ring-opactiy-100"
                    : "ring--1 ring-transparent ring-opacity-0"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {column.tasks.map((task, index) => (
                    <motion.div
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.id)}
                      onClick={() => openDetailModal(task)}
                      layout="position"
                      layoutId={`${column.id}-${task._id}`}
                      style={{ zIndex: column.tasks.length - index }}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        y: -20,
                        transition: {
                          duration: 0.2,
                          ease: [0.4, 0.0, 0.2, 1],
                        },
                      }}
                      whileHover={{
                        y: -4,
                        scale: 1.02,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        },
                      }}
                      transition={{
                        layout: {
                          type: "spring",
                          bounce: 0.1,
                          duration: 0.6,
                          ease: [0.34, 1.56, 0.64, 1],
                        },
                        scale: {
                          duration: 0.15,
                          ease: "easeOut",
                        },
                      }}
                      className="bg-white border border-gray-200 rounded-xl p-3 cursor-move hover:border-gray-300 hover:shadow-md transition-all group"
                    >
                      {/* Task Header with Priority Indicator */}
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${getPriorityDotColor(task.priority)}`}
                          ></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-black text-sm mb-1 line-clamp-2 leading-snug">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Task Meta */}
                      {(task.category ||
                        task.deadline ||
                        (task.tags && task.tags.length > 0)) && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2.5 border-t border-gray-100">
                          {task.category && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                              {task.category}
                            </span>
                          )}
                          {task.deadline && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                isOverdue(task.deadline)
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-gray-50 text-gray-600 border border-gray-200"
                              }`}
                            >
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(task.deadline).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                              <Tag className="w-2.5 h-2.5" />
                              {task.tags.length}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {column.tasks.length === 0 && !searchQuery && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs py-12">
                    <div className="w-12 h-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5 text-gray-300" />
                    </div>
                    <p>Drop tasks here</p>
                  </div>
                )}

                {column.tasks.length === 0 && searchQuery && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs py-12">
                    <Search className="w-6 h-6 mb-2" />
                    <p>No tasks found</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              onClick={closeDetailModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black mb-2">
                      {selectedTask.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 text-black rounded-full ${getPriorityColor(selectedTask.priority)}`}
                      >
                        {mapPriorityToUI(selectedTask.priority)} priority
                      </span>
                      {selectedTask.category && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          {selectedTask.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                  {selectedTask.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}

                  {selectedTask.deadline && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Due Date
                      </h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span
                          className={`text-sm ${isOverdue(selectedTask.deadline) ? "text-red-600 font-semibold" : "text-gray-600"}`}
                        >
                          {new Date(selectedTask.deadline).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                          {isOverdue(selectedTask.deadline) && " (Overdue)"}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
