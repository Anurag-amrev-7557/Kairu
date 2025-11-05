"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Target,
  Zap,
  Info,
} from "lucide-react";

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
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    tip: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || "bg-gray-100 text-gray-800"}`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export default function InsightsCard() {
  const { data: session } = useSession();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
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

    if (session) {
      fetchInsights();
    }
  }, [session]);

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const previousInsight = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  if (loading) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm p-6 h-[300px] flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-spin"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="text-sm text-gray-400">Loading insights...</div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-center text-gray-500">
          <Lightbulb className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium text-red-600">{error}</p>
          <p className="text-sm mt-2">
            Please try again later or contact support if the problem persists.
          </p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchInsights();
            }}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <p className="font-medium text-gray-900">
            Complete more focus sessions to unlock AI insights!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Track your productivity to get personalized recommendations.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/dashboard/focus")}
            className="mt-4 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium">Start Focus Session</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const currentInsight = insights[currentIndex];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Focus Insights</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={previousInsight}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
            disabled={insights.length <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1}/{insights.length}
          </span>
          <button
            onClick={nextInsight}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900"
            disabled={insights.length <= 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <InsightIcon type={currentInsight.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900">
                  {currentInsight.title}
                </h3>
                <InsightBadge type={currentInsight.type} />
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {currentInsight.description}
              </p>
              {currentInsight.metric && (
                <div className="bg-gray-50 px-3 py-2 rounded-lg inline-block">
                  <span className="text-sm font-medium text-gray-900">
                    {currentInsight.metric}
                  </span>
                </div>
              )}
              {currentInsight.suggestion && (
                <div className="mt-3 text-sm text-gray-600">
                  <strong className="font-medium">Suggestion:</strong>{" "}
                  {currentInsight.suggestion}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
