"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Info,
  Lightbulb,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

export default function AIInsights({ token, showHeader = true }) {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/insights?days=30", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch insights");
      }

      setInsights(data.insights || []);
      setMetadata(data.metadata);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Fetch insights error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInsights();
    }
  }, [token]);

  const getInsightIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <TrendingUp className="w-3.5 h-3.5 text-black" strokeWidth={2} />
        );
      case "warning":
        return (
          <AlertTriangle className="w-3.5 h-3.5 text-black" strokeWidth={2} />
        );
      case "tip":
        return <Lightbulb className="w-3.5 h-3.5 text-black" strokeWidth={2} />;
      case "info":
      default:
        return <Info className="w-3.5 h-3.5 text-black" strokeWidth={2} />;
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      {showHeader && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-black">
                <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-black">AI Insights</h3>
            </div>
            <button
              onClick={fetchInsights}
              disabled={isLoading}
              className="p-1.5 text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh insights"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                strokeWidth={2}
              />
            </button>
          </div>

          {metadata && lastRefresh && (
            <div className="mb-3 text-[10px] text-gray-400 uppercase tracking-wide font-medium">
              {metadata.sessionsAnalyzed} sessions •{" "}
              {formatTimeAgo(lastRefresh)}
            </div>
          )}
        </>
      )}

      {!showHeader && metadata && lastRefresh && (
        <div className="mb-3 text-[10px] text-gray-400 uppercase tracking-wide font-medium">
          {metadata.sessionsAnalyzed} sessions • {formatTimeAgo(lastRefresh)}
        </div>
      )}

      {/* Loading State */}
      {isLoading && insights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <Loader2
            className="w-6 h-6 text-black animate-spin"
            strokeWidth={2}
          />
          <p className="text-xs text-gray-500 font-medium">
            Analyzing patterns...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 font-medium">{error}</p>
          <button
            onClick={fetchInsights}
            className="mt-2 text-xs text-black font-semibold hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Insights Display */}
      {!isLoading && !error && insights.length > 0 && (
        <div className="space-y-2.5">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-white transition-all cursor-pointer"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-all">
                    {getInsightIcon(insight.type)}
                  </div>
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[13px] font-bold text-black leading-tight">
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold bg-black text-white rounded-full uppercase tracking-wide">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.suggestion && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-start gap-1.5">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-black flex items-center justify-center mt-0.5">
                          <ChevronRight
                            className="w-2.5 h-2.5 text-white"
                            strokeWidth={3}
                          />
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {insight.suggestion}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && insights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            No insights yet
          </p>
          <p className="text-xs text-gray-500 text-center">
            Complete more focus sessions to unlock AI insights
          </p>
        </div>
      )}
    </div>
  );
}
