"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, CheckCircle, X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useTaskStore from "@/lib/store/taskStore";

export default function NaturalLanguageTaskInput({
  onTaskCreated,
  token,
  value,
  onChange,
}) {
  const { createTask } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedTasks, setParsedTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (showPreview) {
      setIsStale(true);
    }
  }, [value]);

  const handleParse = async () => {
    if (!value.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      setError(null); // Clear any previous errors
      // Parse the natural language input
      const parseResponse = await fetch("/api/ai/parse-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ input: value.trim() }),
      });

      const parseData = await parseResponse.json();

      if (!parseResponse.ok) {
        throw new Error(parseData.error || "Failed to parse task");
      }

      const tasks = parseData.tasks;
      setParsedTasks(
        tasks.map((task) => ({
          ...task,
          _id: `temp_${Date.now()}_${Math.random()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      );
      setCurrentTaskIndex(0);
      setShowPreview(true);
      setIsStale(false);
    } catch (err) {
      console.error("Parse error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!parsedTasks.length || currentTaskIndex >= parsedTasks.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentTask = parsedTasks[currentTaskIndex];

      // Prepare task data with required fields and proper structure
      const taskData = {
        title: currentTask.title,
        description: currentTask.description || "",
        priority: currentTask.priority || "not_urgent_not_important",
        status: "todo",
        estimated_duration: currentTask.estimated_duration || 0,
        scheduled_date: currentTask.scheduled_date || null,
        scheduled_time: currentTask.scheduled_time || null,
        deadline: currentTask.deadline || null,
        category: currentTask.category || "Work",
        tags: currentTask.tags || [],
      };

      // Use Zustand store to create task - this updates all pages automatically
      const createdTask = await createTask(taskData, token);

      // Notify parent component
      if (onTaskCreated) {
        const isLastTask = currentTaskIndex === parsedTasks.length - 1;
        onTaskCreated(createdTask, isLastTask);
      }

      // Move to next task or reset form if all tasks are created
      if (currentTaskIndex < parsedTasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
      } else {
        // Reset form after all tasks are created
        onChange({ target: { value: "" } });
        setParsedTasks([]);
        setCurrentTaskIndex(0);
        setShowPreview(false);
        setIsStale(false);
      }
    } catch (err) {
      console.error("Create task error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setParsedTasks([]);
    setCurrentTaskIndex(0);
    setError(null);
    setIsStale(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleParse();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const priorityLabels = {
    urgent_important: "Urgent & Important",
    urgent_not_important: "Urgent",
    not_urgent_important: "Important",
    not_urgent_not_important: "Low Priority",
  };

  const parseButtonText = showPreview ? "Reparse with AI" : "Parse with AI";

  return (
    <div className="w-full space-y-4">
      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <textarea
              value={value}
              onChange={onChange}
              onKeyDown={handleKeyPress}
              placeholder="Describe your task in natural language... e.g., 'Work on backend API tomorrow at 2pm for 2 hours, high priority'"
              className="w-full min-h-[100px] px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:ring-black-200 resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleParse}
            disabled={!value.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-full hover:bg-white/70 disabled:cursor-not-allowed transition-colors border border-black-500 h-fit"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {parseButtonText}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <AnimatePresence>
        {showPreview && parsedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.5, ease: "easeInOut" },
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-black-500" />
                Task Preview
              </h3>
              <button
                onClick={handleCancel}
                className="text-white hover:text-white/80 hover:bg-white/20 p-1 rounded-full transition-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white border border-black-200 rounded-2xl p-4 space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 pt-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {parsedTasks[currentTaskIndex].title}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Task {currentTaskIndex + 1} of {parsedTasks.length}
                    </div>
                  </div>
                  {parsedTasks[currentTaskIndex].description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {parsedTasks[currentTaskIndex].description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {parsedTasks[currentTaskIndex].priority && (
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {priorityLabels[parsedTasks[currentTaskIndex].priority]}
                      </span>
                    </div>
                  )}

                  {parsedTasks[currentTaskIndex].estimated_duration && (
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {parsedTasks[currentTaskIndex].estimated_duration} min
                      </span>
                    </div>
                  )}

                  {parsedTasks[currentTaskIndex].deadline && (
                    <div>
                      <span className="text-gray-500">Deadline:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatDate(parsedTasks[currentTaskIndex].deadline)}
                      </span>
                    </div>
                  )}

                  {parsedTasks[currentTaskIndex].scheduled_date && (
                    <div>
                      <span className="text-gray-500">Scheduled:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatDate(
                          parsedTasks[currentTaskIndex].scheduled_date,
                        )}
                        {parsedTasks[currentTaskIndex].scheduled_time &&
                          ` at ${parsedTasks[currentTaskIndex].scheduled_time}`}
                      </span>
                    </div>
                  )}

                  {parsedTasks.energy_required && (
                    <div>
                      <span className="text-gray-500">Energy:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">
                        {parsedTasks.energy_required}
                      </span>
                    </div>
                  )}

                  {parsedTasks.complexity_score && (
                    <div>
                      <span className="text-gray-500">Complexity:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {parsedTasks.complexity_score}/10
                      </span>
                    </div>
                  )}

                  {parsedTasks.best_time_of_day && (
                    <div>
                      <span className="text-gray-500">Best Time:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">
                        {parsedTasks.best_time_of_day}
                      </span>
                    </div>
                  )}

                  {parsedTasks.category && (
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium text-gray-900 capitalize">
                        {parsedTasks.category}
                      </span>
                    </div>
                  )}
                </div>

                {parsedTasks[currentTaskIndex].tags &&
                  parsedTasks[currentTaskIndex].tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {parsedTasks[currentTaskIndex].tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-black-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <button
                onClick={handleCreateTask}
                disabled={isLoading || isStale}
                className="flex-1 flex items-center justify-center bg-white gap-2 px-4 py-2 rounded-full hover:bg-white/70 disabled:cursor-not-allowed transition-colors border border-gray-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {currentTaskIndex < parsedTasks.length - 1
                      ? `Create Task (${currentTaskIndex + 1}/${parsedTasks.length})`
                      : "Create Task"}
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-black/80 text-white rounded-full hover:bg-gray-300 hover:text-black transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
