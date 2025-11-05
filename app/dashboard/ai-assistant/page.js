"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  ChevronRight,
  Calendar,
  Clock,
  Tag,
  Target,
  Command,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import NaturalLanguageTaskInput from "../../../components/dashboard/NaturalLanguageTaskInput";
import AIInsights from "../../../components/dashboard/AIInsights";
import useTaskStore from "../../../lib/store/taskStore";
import { toast } from "sonner";

export default function AIAssistantPage() {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState("");
  const { fetchTasks } = useTaskStore();
  const [activeTab, setActiveTab] = useState("create");

  const handleTaskCreated = (task) => {
    toast.success("Task created successfully!", {
      description: task.title,
    });
    // Refresh tasks list
    if (session?.user?.token) {
      fetchTasks({}, session.user.token);
    }
  };

  const tabs = [
    {
      id: "create",
      label: "Task Creation",
      icon: Zap,
    },
    {
      id: "insights",
      label: "Focus Insights",
      icon: TrendingUp,
    },
  ];

  const examples = [
    "Work on backend API tomorrow at 2pm for 2 hours, high priority",
    "Design new landing page by Friday, needs creative energy",
    "Review pull requests tonight, low priority, 30 minutes",
    "Team meeting next Monday at 10am, important but not urgent",
    "Write blog post about AI features, deadline March 15th",
  ];

  const features = [
    {
      icon: Calendar,
      title: "Smart Dates",
      description:
        "Understands relative dates like 'tomorrow' and 'next Friday'",
    },
    {
      icon: Clock,
      title: "Time Detection",
      description: "Automatically extracts times and duration estimates",
    },
    {
      icon: Target,
      title: "Priority Parsing",
      description: "Recognizes urgency levels from your description",
    },
    {
      icon: Tag,
      title: "Auto-Tagging",
      description: "Generates relevant tags and categories automatically",
    },
  ];

  const handleExampleClick = (example) => {
    setInputValue(example); // replace the text
    // OR append it instead of replacing:
    // setInputValue(prev => prev + " " + example);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <div className="h-full flex flex-col max-w-[1400px] mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-black">
              <Brain className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                AI Assistant
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Powered by Google Gemini
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-shrink-0 mb-6"
        >
          <div className="inline-flex bg-white rounded-full p-0.5 border border-gray-200 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isActive ? "text-white" : "text-gray-600 hover:text-black"
                  }`}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-black rounded-full"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" strokeWidth={2} />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pb-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Input Card - Takes 2 columns */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Task Input Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h2 className="text-lg font-bold text-black mb-1">
                            Create Task with AI
                          </h2>
                          <p className="text-sm text-gray-500">
                            Describe your task naturally and let AI handle the
                            details
                          </p>
                        </div>
                        <div className="p-2 rounded-full bg-gray-50 border border-gray-200">
                          <Sparkles
                            className="w-5 h-5 text-black"
                            strokeWidth={2}
                          />
                        </div>
                      </div>

                      {session?.user?.token ? (
                        <div>
                          <NaturalLanguageTaskInput
                            value={inputValue}
                            token={session.user.token}
                            onChange={(e) => setInputValue(e.target.value)}
                            onTaskCreated={handleTaskCreated}
                          />
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                            Press{" "}
                            <kbd className="px-2 py-1.5 flex items-center text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full">
                              <Command className="inline w-3 h-3" />
                              /Ctrl + Enter
                            </kbd>{" "}
                            to parse
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-gray-600">
                            Please sign in to use AI features
                          </p>
                        </div>
                      )}
                    </motion.div>

                    {/* Examples Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb
                          className="w-5 h-5 text-black"
                          strokeWidth={2}
                        />
                        <h3 className="text-md font-semibold text-black">
                          Example Inputs
                        </h3>
                      </div>
                      <div className="space-y-2.5">
                        {examples.map((example, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            onClick={() => handleExampleClick(example)}
                            className="group p-3 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight
                                className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition-colors"
                                strokeWidth={2}
                              />
                              <p className="text-xs text-gray-700 group-hover:text-black font-mono transition-colors">
                                "{example}"
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Features Sidebar - Takes 1 column */}
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
                    >
                      <h3 className="text-base font-bold text-black mb-4">
                        AI Capabilities
                      </h3>
                      <div className="space-y-4">
                        {features.map((feature, index) => {
                          const Icon = feature.icon;
                          return (
                            <motion.div
                              key={feature.title}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + index * 0.05 }}
                              className="flex gap-3"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                                <Icon
                                  className="w-5 h-5 text-black"
                                  strokeWidth={2}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-black mb-0.5">
                                  {feature.title}
                                </h4>
                                <p className="text-[12px] text-gray-500 leading-relaxed">
                                  {feature.description}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Info Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-gray-50 rounded-2xl p-5 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-full bg-white border border-gray-200">
                          <Sparkles
                            className="w-5 h-5 text-black"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-black mb-1.5">
                            Powered by Gemini
                          </h4>
                          <p className="text-[12px] text-gray-600 leading-relaxed">
                            Using Google's advanced AI to understand your tasks
                            and provide intelligent suggestions.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="pb-6"
              >
                <div className="max-w-8xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
                  >
                    {session?.user?.token ? (
                      <AIInsights
                        token={session.user.token}
                        showHeader={true}
                      />
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                          <TrendingUp
                            className="w-8 h-8 text-gray-400"
                            strokeWidth={2}
                          />
                        </div>
                        <h3 className="text-lg font-bold text-black mb-2">
                          Sign in to view insights
                        </h3>
                        <p className="text-sm text-gray-500">
                          AI insights are available for authenticated users
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Insights Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {[
                      {
                        icon: TrendingUp,
                        title: "Pattern Detection",
                        desc: "Identifies your most productive times",
                      },
                      {
                        icon: Target,
                        title: "Smart Analysis",
                        desc: "Analyzes 30 days of focus data",
                      },
                      {
                        icon: Lightbulb,
                        title: "Actionable Tips",
                        desc: "Get personalized recommendations",
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + index * 0.05 }}
                          className="bg-white rounded-xl p-4 border border-gray-200"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
                            <Icon
                              className="w-5 h-5 text-black"
                              strokeWidth={2}
                            />
                          </div>
                          <h4 className="text-sm font-bold text-black mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
