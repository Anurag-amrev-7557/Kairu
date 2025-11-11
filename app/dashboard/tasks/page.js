"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  GalleryVerticalEnd,
  Circle,
  Calendar,
  Trash2,
  Edit3,
  Play,
  CheckLine,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronDown,
  Check,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Signal,
  Zap,
  Eye,
  Filter,
  Tag,
} from "lucide-react";
import useTaskStore from "../../../lib/store/taskStore";
import { useSession } from "next-auth/react";
import CalendarSelector from "../../../components/shared/CalendarSelector";

const filterOptions = [
  { label: "All", Icon: GalleryVerticalEnd },
  { label: "Active", Icon: Play },
  { label: "Completed", Icon: CheckLine },
];
const priorityOptions = [
  { label: "All", Icon: Signal },
  { label: "High", Icon: Zap },
  { label: "Medium", Icon: AlertTriangle },
  { label: "Low", Icon: AlertCircle },
];

export default function TasksPage() {
  const {
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    loading,
    hasMore,
    loadMoreTasks,
    totalTasks,
  } = useTaskStore();
  const { data: session } = useSession();
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    category: "Work",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const titleRefs = useRef({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortBy, setSortBy] = useState("dueDate"); // "dueDate", "priority", "title", "createdDate"
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isCategorizingTask, setIsCategorizingTask] = useState(false);
  const [isCategorizingAll, setIsCategorizingAll] = useState(false);
  const [categorizationSuccess, setCategorizationSuccess] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);

  // Infinite scroll handler
  const handleScroll = (e) => {
    const container = e.target;
    const scrollBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (scrollBottom < 200 && !loading && hasMore) {
      loadMoreTasks(session?.user?.token);
    }
  };

  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
      return () => mainContent.removeEventListener("scroll", handleScroll);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (session?.user?.token) {
      fetchTasks({}, session.user.token);
    }
  }, [session?.user?.token]);

  // Get all unique tags from tasks
  const allTags = ["All", ...new Set(tasks.flatMap((task) => task.tags || []))];

  // Helper function to map database priority to UI priority
  const mapPriorityToUI = (dbPriority) => {
    const priorityMap = {
      urgent_important: "high",
      urgent_not_important: "medium",
      not_urgent_important: "medium",
      not_urgent_not_important: "low",
    };
    return priorityMap[dbPriority] || "low";
  };

  // Helper function to check if task is completed
  const isTaskCompleted = (task) => {
    return task.status === "completed" || task.completed === true;
  };

  const filteredTasks = tasks
    .filter((task) => {
      const completed = isTaskCompleted(task);
      const matchesFilter =
        filter === "All" ||
        (filter === "Active" && !completed) ||
        (filter === "Completed" && completed);

      const uiPriority = mapPriorityToUI(task.priority);
      const matchesPriority =
        priorityFilter === "All" || uiPriority === priorityFilter.toLowerCase();

      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === "All" || (task.tags && task.tags.includes(selectedTag));

      return matchesFilter && matchesPriority && matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          const aDate = a.deadline || a.dueDate;
          const bDate = b.deadline || b.dueDate;
          if (!aDate) return 1;
          if (!bDate) return -1;
          return new Date(aDate) - new Date(bDate);
        case "priority":
          const priorityOrder = {
            urgent_important: 0,
            urgent_not_important: 1,
            not_urgent_important: 2,
            not_urgent_not_important: 3,
          };
          return (
            (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "createdDate":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  const toggleTask = (id) => {
    const task = tasks.find((t) => t._id === id);

    if (task && session?.user?.token) {
      const isCompleted = isTaskCompleted(task);
      const newStatus = isCompleted ? "todo" : "completed";
      updateTask(id, { status: newStatus }, session.user.token);
    }
  };

  const handleDelete = (id) => {
    if (session?.user?.token) {
      deleteTask(id, session.user.token);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTagInput("");
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      tags: [],
      dueDate: "",
      category: "Work",
    });
    setShowModal(true);
  };

  // Get unique categories from tasks (dynamic categories)
  const categoryOptions =
    dynamicCategories.length > 0
      ? dynamicCategories
      : [...new Set(tasks.map((task) => task.category).filter(Boolean))];

  // Group tasks by category
  const groupedTasks = categoryOptions.reduce((acc, category) => {
    const tasksInCategory = filteredTasks.filter(
      (task) => task.category === category,
    );
    if (tasksInCategory.length > 0) {
      acc[category] = tasksInCategory;
    }
    return acc;
  }, {});

  const openEditModal = (task) => {
    setEditingTask(task);
    setTagInput("");

    // Map database fields to form fields
    const uiPriority = mapPriorityToUI(task.priority);
    const dueDate = task.deadline || task.dueDate;

    setFormData({
      title: task.title,
      description: task.description || "",
      priority: uiPriority,
      dueDate: dueDate ? dueDate.split("T")[0] : "",
      category: task.category || "Work",
      tags: task.tags || [],
    });
    setShowModal(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const openDetailModal = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  const autoCategorizeTask = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a task title first");
      return;
    }

    setIsCategorizingTask(true);
    try {
      const response = await fetch("/api/tasks/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          ...formData,
          category: data.category,
          priority: data.priority,
        });
      }
    } catch (error) {
      console.error("Auto-categorization failed:", error);
      alert("Failed to auto-categorize. Please try again.");
    } finally {
      setIsCategorizingTask(false);
    }
  };

  const autoCategorizeAllTasks = async () => {
    if (tasks.length === 0) {
      alert("No tasks to categorize");
      return;
    }

    setIsCategorizingAll(true);
    setCategorizationSuccess(false);

    try {
      const response = await fetch("/api/tasks/categorize-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: tasks.map((t) => ({
            id: t._id,
            title: t.title,
            description: t.description,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Bulk update all tasks with their new categories
        const updates = data.categorizedTasks.map((categorized) => ({
          taskId: categorized.id,
          updates: { category: categorized.category },
        }));

        await bulkUpdateTasks(updates, session.user.token);

        setDynamicCategories(data.categories);

        // Show success state
        setCategorizationSuccess(true);

        // Hide success state after 2 seconds
        setTimeout(() => {
          setCategorizationSuccess(false);
        }, 2000);
      } else {
        alert("Failed to categorize tasks: " + (data.details || data.error));
      }
    } catch (error) {
      console.error("Error categorizing all tasks:", error);
      alert("Failed to categorize tasks");
    } finally {
      setIsCategorizingAll(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !session?.user?.token) {
      console.log("Form validation failed:", {
        title: formData.title,
        hasToken: !!session?.user?.token,
      });
      return;
    }

    // Map form data to database schema
    const priorityMap = {
      high: "urgent_important",
      medium: "not_urgent_important",
      low: "not_urgent_not_important",
    };

    const taskData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      priority: priorityMap[formData.priority] || "not_urgent_not_important",
      deadline: formData.dueDate || null,
      status: "todo",
    };

    console.log("Submitting task:", taskData);

    try {
      if (editingTask) {
        await updateTask(editingTask._id, taskData, session.user.token);
      } else {
        await createTask(taskData, session.user.token);
      }
      closeModal();
    } catch (error) {
      console.error("Task submission error:", error);
      alert("Failed to save task: " + error.message);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    if (diff < 0) return "Overdue";

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const activeTasks = tasks.filter((t) => !isTaskCompleted(t)).length;
  const completedTasks = tasks.filter((t) => isTaskCompleted(t)).length;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Modern Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black tracking-tight mb-2">
                Tasks
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {activeTasks} Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {completedTasks} Completed
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {tasks.length} Total
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={autoCategorizeAllTasks}
                disabled={
                  isCategorizingAll ||
                  categorizationSuccess ||
                  tasks.length === 0
                }
                whileHover={{ scale: categorizationSuccess ? 1 : 1.02 }}
                whileTap={{ scale: categorizationSuccess ? 1 : 0.98 }}
                animate={
                  categorizationSuccess
                    ? { backgroundColor: "#000000", borderColor: "#000000" }
                    : { backgroundColor: "#ffffff", borderColor: "#e5e5e5" }
                }
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-2 px-4 py-3 border rounded-full text-sm font-medium disabled:cursor-not-allowed ${
                  categorizationSuccess
                    ? "text-white"
                    : "text-gray-700 hover:border-gray-300 hover:shadow-md disabled:opacity-40"
                }`}
              >
                {isCategorizingAll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Categorizing...</span>
                  </>
                ) : categorizationSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Categorized!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Categorize</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={openCreateModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-3 bg-black/90 text-white rounded-full text-sm font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all"
              >
                <Plus className="w-5 h-5" />
                New Task
              </motion.button>
            </div>
          </div>

          {/* Modern Search & Filters */}
          <div className="space-y-4">
            {/* Search, Sort, and View Toggle Row */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
                />
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-3 relative">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </span>
                <motion.button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 scale-95 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all cursor-pointer"
                >
                  <span>
                    {sortBy === "dueDate"
                      ? "Due Date"
                      : sortBy === "priority"
                        ? "Priority"
                        : sortBy === "title"
                          ? "Title"
                          : "Created Date"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showSortDropdown ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* Custom Dropdown */}
                <AnimatePresence>
                  {showSortDropdown && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSortDropdown(false)}
                      />

                      {/* Dropdown Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-[180px]"
                      >
                        {[
                          { value: "dueDate", label: "Due Date" },
                          { value: "priority", label: "Priority" },
                          { value: "title", label: "Title" },
                          { value: "createdDate", label: "Created Date" },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortDropdown(false);
                            }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                              sortBy === option.value
                                ? "text-black font-medium bg-gray-50"
                                : "text-gray-700"
                            }`}
                          >
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <Check className="w-4 h-4 text-black" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-3 scale-104">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">View</span>
                </div>
                <div className="flex bg-gray-100 rounded-full p-1">
                  <motion.button
                    onClick={() => setViewMode("grid")}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-3 py-2 rounded-full transition-colors ${
                      viewMode === "grid" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {viewMode === "grid" && (
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
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-xs font-medium">Grid</span>
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("list")}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-3 py-2 rounded-full transition-colors ${
                      viewMode === "list" ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {viewMode === "list" && (
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
                      <List className="w-4 h-4" />
                      <span className="text-xs font-medium">List</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Status and Priority Filters Row */}
            <div className="flex items-center gap-6">
              {/* Status Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="relative flex bg-gray-50 rounded-full p-1">
                  {filterOptions.map(({ label, Icon }) => (
                    <motion.button
                      key={label}
                      onClick={() => setFilter(label)}
                      className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        filter === label
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {filter === label && (
                        <motion.div
                          layoutId="statusBackground"
                          className="absolute inset-0 bg-black/90 rounded-full cursor-pointer"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4" strokeWidth={1.5} />}
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200"></div>

              {/* Priority Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">Priority</span>
                </div>
                <div className="relative flex bg-gray-50 rounded-full p-1">
                  {priorityOptions.map(({ label, Icon }) => (
                    <motion.button
                      key={label}
                      onClick={() => setPriorityFilter(label)}
                      className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                        priorityFilter === label
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {priorityFilter === label && (
                        <motion.div
                          layoutId="priorityBackground"
                          className="absolute inset-0 bg-gray-900 rounded-full cursor-pointer"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task List/Grid - Grouped by Category */}
        <AnimatePresence mode="wait">
          {filteredTasks.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative overflow-hidden text-center py-20 rounded-3xl"
            >
              {/* Decorative circles */}
              <div className="absolute top-10 left-10 w-32 h-32 bg-gray-100 rounded-full opacity-40 blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-gray-100 rounded-full opacity-40 blur-2xl"></div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"
                >
                  <Circle className="w-10 h-10 text-gray-400 stroke-[1.5]" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-2xl font-bold text-black mb-3"
                >
                  No tasks found
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-base text-gray-500 mb-8 max-w-md mx-auto"
                >
                  Start organizing your work by creating your first task
                </motion.p>

                <motion.button
                  onClick={openCreateModal}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-black/90 text-white rounded-full text-sm font-semibold shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-shadow"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Task
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {Object.entries(groupedTasks).map(([category, tasks]) => (
                <motion.div key={category}>
                  {/* Category Header */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>{category}</span>
                    <span className="text-sm font-normal text-gray-400">
                      ({tasks.length})
                    </span>
                  </h3>

                  {/* Tasks in this category */}
                  <motion.div
                    layout
                    initial={false}
                    transition={{
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                  >
                    <motion.div
                      layout
                      initial={false}
                      transition={{
                        layout: { type: "spring", stiffness: 200, damping: 25 },
                      }}
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          : "flex flex-col gap-3"
                      }
                    >
                      {tasks.map((task, index) => {
                        const taskCompleted = isTaskCompleted(task);
                        const taskPriority = mapPriorityToUI(task.priority);
                        const taskDueDate = task.deadline || task.dueDate;

                        return (
                          <motion.div
                            key={task._id}
                            className={`
                              group bg-white border border-gray-200/50 shadow-sm
                              hover:shadow-xl hover:border-gray-300
                              transition-all duration-200 cursor-pointer
                              ${taskCompleted ? "opacity-60" : ""}
                              ${
                                viewMode === "grid"
                                  ? "rounded-2xl p-5"
                                  : "rounded-full p-4 flex items-center gap-4 relative"
                              }
                            `}
                            onMouseEnter={() =>
                              viewMode === "list" && setHoveredTask(task._id)
                            }
                            onMouseLeave={() =>
                              viewMode === "list" && setHoveredTask(null)
                            }
                            onClick={() => openDetailModal(task)}
                          >
                            {/* Content */}
                            <motion.div
                              layout
                              initial={false}
                              transition={{
                                layout: {
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                },
                              }}
                              className={`flex-1 min-w-0 ${viewMode === "list" ? "flex items-center gap-4" : ""}`}
                            >
                              <motion.div
                                layout
                                initial={false}
                                transition={{
                                  layout: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                  },
                                }}
                                className={`flex-1 ${viewMode === "list" ? "" : "min-w-0"}`}
                              >
                                <motion.div
                                  layout="position"
                                  transition={{
                                    layout: {
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 25,
                                    },
                                  }}
                                  className={`flex gap-3 ${viewMode === "grid" ? "items-start mb-2" : "items-center"}`}
                                >
                                  {/* Checkbox */}
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTask(task._id);
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 15,
                                    }}
                                    className={`flex-shrink-0 ${viewMode === "grid" ? "mt-0.5" : ""}`}
                                  >
                                    <motion.div
                                      initial={false}
                                      animate={{
                                        backgroundColor: taskCompleted
                                          ? "rgba(0, 0, 0, 0.9)"
                                          : "transparent",
                                        borderColor: taskCompleted
                                          ? "rgba(0, 0, 0, 0.9)"
                                          : "rgb(209, 213, 219)",
                                        scale: taskCompleted ? 1 : 0.95,
                                      }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                        mass: 1,
                                      }}
                                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                    >
                                      <motion.svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2.5"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{
                                          opacity: taskCompleted ? 1 : 0,
                                          scale: taskCompleted ? 1 : 0.5,
                                        }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 500,
                                          damping: 25,
                                          mass: 0.8,
                                        }}
                                      >
                                        <motion.path
                                          initial={{ pathLength: 0 }}
                                          animate={{
                                            pathLength: taskCompleted ? 1 : 0,
                                          }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 35,
                                            mass: 0.5,
                                          }}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </motion.svg>
                                    </motion.div>
                                  </motion.button>

                                  <div className="flex-1 relative inline-block">
                                    <h3
                                      ref={(el) => {
                                        if (el) {
                                          titleRefs.current[task._id] = el;
                                        }
                                      }}
                                      className={`inline text-sm font-bold leading-tight ${
                                        taskCompleted
                                          ? "line-through text-gray-400"
                                          : "text-black"
                                      }`}
                                    >
                                      {task.title}
                                    </h3>

                                    {/* Tooltip for list view - right of title */}
                                    <AnimatePresence>
                                      {viewMode === "list" &&
                                        hoveredTask === task._id &&
                                        task.description &&
                                        titleRefs.current[task._id] && (
                                          <motion.div
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{
                                              duration: 0.2,
                                              ease: "easeOut",
                                            }}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                                            style={{
                                              left: `${titleRefs.current[task._id].offsetWidth + 12}px`,
                                            }}
                                          >
                                            <div className="bg-white border border-gray-200 text-gray-700 text-xs rounded-4xl px-4 py-3 shadow-xl max-w-md backdrop-blur-sm">
                                              <div className="relative">
                                                {/* Arrow */}
                                                <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                                                  <div className="w-3 h-3 bg-white border-l border-t border-gray-200 rotate-[-45deg]"></div>
                                                </div>
                                                <p className="leading-relaxed line-clamp-6">
                                                  {task.description}
                                                </p>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                    </AnimatePresence>
                                  </div>

                                  {/* Actions for grid view - at the right end of title */}
                                  {viewMode === "grid" && (
                                    <div className="flex gap-1">
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(task);
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                      >
                                        <Edit3 className="w-4 h-4 text-gray-500" />
                                      </motion.button>
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(task._id);
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </motion.button>
                                    </div>
                                  )}
                                </motion.div>

                                {viewMode === "grid" && task.description && (
                                  <p
                                    className={`text-xs mb-3 line-clamp-2 leading-relaxed ml-8 ${
                                      taskCompleted
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {task.description}
                                  </p>
                                )}
                              </motion.div>

                              {/* Meta */}
                              <motion.div
                                className={`flex items-center gap-2 ${viewMode === "list" ? "" : "flex-wrap ml-8"}`}
                              >
                                <div
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                                    taskPriority === "high"
                                      ? "bg-red-50"
                                      : taskPriority === "medium"
                                        ? "bg-yellow-50"
                                        : "bg-blue-50"
                                  }`}
                                >
                                  {taskPriority === "high" ? (
                                    <Zap className="w-3.5 h-3.5 text-red-700" />
                                  ) : taskPriority === "medium" ? (
                                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-700" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
                                  )}
                                  <span
                                    className={`text-xs font-semibold ${
                                      taskPriority === "high"
                                        ? "text-red-700"
                                        : taskPriority === "medium"
                                          ? "text-yellow-700"
                                          : "text-blue-700"
                                    }`}
                                  >
                                    {taskPriority}
                                  </span>
                                </div>

                                {taskDueDate && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="font-medium">
                                      {formatDueDate(taskDueDate)}
                                    </span>
                                  </div>
                                )}

                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  {task.category}
                                </span>
                              </motion.div>
                            </motion.div>

                            {/* Actions for list view - at the far right */}
                            {viewMode === "list" && (
                              <div className="flex gap-1">
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(task);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  <Edit3 className="w-4 h-4 text-gray-500" />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(task._id);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </motion.button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}{" "}
                      {/* <-- FIX: Added closing brace and parenthesis */}
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white rounded-3xl shadow-2xl max-w-xl w-full pointer-events-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with gradient */}
                <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-gray-50 to-white">
                  <motion.button
                    onClick={closeModal}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-6 right-6 p-2 hover:bg-white/80 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </motion.button>

                  <h2 className="text-2xl font-bold text-black mb-1">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {editingTask
                      ? "Update task details below"
                      : "Fill in the details to create a new task"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black/90"></span>
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Review pull requests"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all"
                      required
                      autoFocus
                    />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black/90"></span>
                      Description
                      <span className="text-xs font-normal text-gray-400">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Add more details about this task..."
                      rows={6}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all resize-none"
                    />
                  </div>
                  {/* Priority */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-black/90"></span>
                      Priority
                    </label>
                    <div className="flex gap-2 flex-1">
                      {["low", "medium", "high"].map((priority) => (
                        <motion.button
                          key={priority}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority })}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-full transition-all flex items-center justify-center gap-2 ${
                            formData.priority === priority
                              ? priority === "high"
                                ? "bg-red-500 text-white shadow-lg shadow-red-200"
                                : priority === "medium"
                                  ? "bg-yellow-500 text-white shadow-lg shadow-yellow-200"
                                  : "bg-blue-500 text-white shadow-lg shadow-blue-200"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {priority === "high" ? (
                            <Zap className="w-4 h-4" />
                          ) : priority === "medium" ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  {/* Date and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Due Date
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-black text-left focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all"
                      >
                        {formData.dueDate
                          ? new Date(formData.dueDate).toLocaleDateString()
                          : "Select a date"}
                      </button>
                      <AnimatePresence>
                        {showCalendar && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 z-10"
                          >
                            <CalendarSelector
                              selectedDate={
                                formData.dueDate
                                  ? new Date(formData.dueDate)
                                  : new Date()
                              }
                              setSelectedDate={(date) => {
                                setFormData({
                                  ...formData,
                                  dueDate: date.toISOString().split("T")[0],
                                });
                                setShowCalendar(false);
                              }}
                              sessions={[]} // You might want to pass actual sessions if you have them
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="w-3.5 h-3.5 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        </span>
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="Enter custom category..."
                        list="category-suggestions"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all"
                      />
                      <datalist id="category-suggestions">
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  {/* Tags */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black/90"></span>
                      Tags
                      <span className="text-xs font-normal text-gray-400">
                        (Optional)
                      </span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="Add a tag and press Enter..."
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all"
                      />
                      <motion.button
                        type="button"
                        onClick={addTag}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 bg-black/90 text-white text-sm font-medium rounded-full hover:bg-gray-900 transition-colors"
                      >
                        Add
                      </motion.button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      onClick={closeModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-black/90 hover:bg-gray-900 rounded-full shadow-lg shadow-black/20 transition-all"
                    >
                      {editingTask ? "Save Changes" : "Create Task"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal &&
          selectedTask &&
          (() => {
            const modalTaskCompleted = isTaskCompleted(selectedTask);
            const modalTaskPriority = mapPriorityToUI(selectedTask.priority);
            const modalTaskDueDate =
              selectedTask.deadline || selectedTask.dueDate;

            return (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={closeDetailModal}
                  className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
                />

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="relative px-6 py-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                      <motion.button
                        onClick={closeDetailModal}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-4 right-4 p-1.5 hover:bg-white/80 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </motion.button>

                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <motion.button
                          onClick={() => toggleTask(selectedTask._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          }}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              backgroundColor: isTaskCompleted(selectedTask)
                                ? "rgba(0, 0, 0, 0.9)"
                                : "transparent",
                              borderColor: isTaskCompleted(selectedTask)
                                ? "rgba(0, 0, 0, 0.9)"
                                : "rgb(209, 213, 219)",
                              scale: isTaskCompleted(selectedTask) ? 1 : 0.95,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                              mass: 1,
                            }}
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          >
                            <motion.svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{
                                opacity: isTaskCompleted(selectedTask) ? 1 : 0,
                                scale: isTaskCompleted(selectedTask) ? 1 : 0.5,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                                mass: 0.8,
                              }}
                            >
                              <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{
                                  pathLength: isTaskCompleted(selectedTask)
                                    ? 1
                                    : 0,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 35,
                                  mass: 0.5,
                                }}
                                d="M5 13l4 4L19 7"
                              />
                            </motion.svg>
                          </motion.div>
                        </motion.button>

                        <motion.div className="flex-1 pr-6">
                          <h2
                            className={`text-lg font-bold mb-2 ${
                              modalTaskCompleted
                                ? "line-through text-gray-400"
                                : "text-black"
                            }`}
                          >
                            {selectedTask.title}
                          </h2>
                          <motion.div className="flex items-center gap-2 flex-wrap">
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                                modalTaskPriority === "high"
                                  ? "bg-red-50"
                                  : modalTaskPriority === "medium"
                                    ? "bg-yellow-50"
                                    : "bg-blue-50"
                              }`}
                            >
                              {modalTaskPriority === "high" ? (
                                <Zap className="w-3.5 h-3.5 text-red-700" />
                              ) : modalTaskPriority === "medium" ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-yellow-700" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
                              )}
                              <span
                                className={`text-xs font-semibold ${
                                  modalTaskPriority === "high"
                                    ? "text-red-700"
                                    : modalTaskPriority === "medium"
                                      ? "text-yellow-700"
                                      : "text-blue-700"
                                }`}
                              >
                                {modalTaskPriority}
                              </span>
                            </div>

                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {selectedTask.category}
                            </span>

                            {modalTaskDueDate && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="font-medium">
                                  {formatDueDate(modalTaskDueDate)}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                      {selectedTask.description && (
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words max-h-[50vh] overflow-y-auto pr-2 mb-4">
                          {selectedTask.description}
                        </p>
                      )}

                      {selectedTask.tags && selectedTask.tags.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {selectedTask.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                      <motion.button
                        onClick={() => {
                          closeDetailModal();
                          openEditModal(selectedTask);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          handleDelete(selectedTask._id);
                          closeDetailModal();
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}
