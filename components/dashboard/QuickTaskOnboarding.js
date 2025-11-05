"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  X,
  Sparkles,
  ArrowRight,
  Keyboard,
  Calendar,
  Clock,
} from "lucide-react";
import { useIsMac } from "../../lib/useIsMac";

export default function QuickTaskOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const isMac = useIsMac();
  const fullText =
    "Write backend API tomorrow at 2pm for 2 hours, high priority";

  // Auto-advance steps
  useEffect(() => {
    if (step === 1) {
      // Show keyboard animation for 2 seconds
      const timer = setTimeout(() => {
        setStep(2);
      }, 2500);
      return () => clearTimeout(timer);
    } else if (step === 2) {
      // Show modal appearing, then start typing
      const timer = setTimeout(() => {
        setIsTyping(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Typing animation - faster speed
  useEffect(() => {
    if (isTyping && typedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 30); // Reduced from 50ms to 30ms for faster typing
      return () => clearTimeout(timer);
    } else if (isTyping && typedText.length === fullText.length) {
      // Show final step after typing completes
      const timer = setTimeout(() => {
        setStep(3);
      }, 800); // Reduced from 1000ms to 800ms
      return () => clearTimeout(timer);
    }
  }, [isTyping, typedText, fullText]);

  const handleSkip = () => {
    localStorage.setItem("hasSeenQuickTaskOnboarding", "true");
    onComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenQuickTaskOnboarding", "true");
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl mx-4"
        >
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            Skip tutorial
            <X className="w-4 h-4" />
          </button>

          {/* Main Content - Clean without card wrapper */}
          <div className="w-full max-w-5xl">
            {/* Animation Area - No padding or background */}
            <div className="min-h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {/* Step 1: Keyboard Shortcut Animation */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center space-y-8"
                  >
                    <div className="flex items-center justify-center gap-6">
                      {/* Command/Ctrl Key */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 4px 6px rgba(0,0,0,0.1)",
                            "0 10px 25px rgba(0,0,0,0.2)",
                            "0 4px 6px rgba(0,0,0,0.1)",
                          ],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 0.4,
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-gray-300 shadow-lg"
                      >
                        <Command className="w-12 h-12 text-gray-700" />
                      </motion.div>

                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="text-4xl font-bold text-gray-400"
                      >
                        +
                      </motion.div>

                      {/* K Key */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 4px 6px rgba(0,0,0,0.1)",
                            "0 10px 25px rgba(0,0,0,0.2)",
                            "0 4px 6px rgba(0,0,0,0.1)",
                          ],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 0.4,
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-gray-300 shadow-lg"
                      >
                        <span className="text-4xl font-bold text-gray-700">
                          K
                        </span>
                      </motion.div>
                    </div>

                    <div className="space-y-2 flex flex-col justify-center items-center">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2 text-center">
                        Press
                        <div className="flex items-center gap-2">
                          <Command className="w-5 h-5" />K
                        </div>
                        (or Ctrl+K)
                      </h3>
                      <p className="text-white/80 mt-2">
                        Use this shortcut anywhere in the app
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Modal Appears + Typing Animation */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl"
                  >
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      className="bg-white border-2 border-gray-300 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      {/* Mock Modal Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Command className="w-5 h-5 text-gray-700" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Quick Task Input
                          </h3>
                        </div>
                      </div>

                      {/* Mock Textarea with Typing */}
                      <div className="p-6">
                        <div className="relative">
                          <div className="min-h-[120px] px-4 py-3 bg-gray-50 border-2 border-black rounded-xl">
                            <p className="text-gray-900 text-base">
                              {typedText}
                              {isTyping &&
                                typedText.length < fullText.length && (
                                  <motion.span
                                    animate={{ opacity: [1, 1, 0, 0] }}
                                    transition={{
                                      duration: 0.9,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      times: [0, 0.5, 0.5, 1],
                                    }}
                                    className="inline-block w-0.5 h-5 bg-black ml-0.5"
                                  />
                                )}
                            </p>
                            {!isTyping && (
                              <p className="text-gray-400 text-sm">
                                Describe your task in natural language...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mock Footer */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-xs text-gray-400 flex gap-2 items-center">
                            Press{" "}
                            <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-200 rounded-full flex items-center">
                              <Command className="w-4 h-4 mr-1" /> + Enter
                            </kbd>{" "}
                            to parse
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center mt-6 space-y-2"
                    >
                      <h3 className="text-xl font-bold text-white">
                        Type naturally
                      </h3>
                      <p className="text-white/80">
                        AI understands dates, times, priorities, and more
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Task Cards Creation */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-3xl space-y-6"
                  >
                    {/* Title */}
                    <div className="text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2">
                          AI Creates Your Task ✨
                        </h3>
                        <p className="text-sm text-white/70">
                          Based on your prompt:{" "}
                          <span className="font-medium text-white">
                            "Write backend API tomorrow at 2pm for 2 hours, high
                            priority"
                          </span>
                        </p>
                      </motion.div>
                    </div>

                    {/* Task Card Animation */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring", damping: 20 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"
                        />

                        <div className="flex-1 space-y-3">
                          {/* Title */}
                          <motion.h4
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="font-semibold text-gray-900"
                          >
                            Write backend API
                          </motion.h4>

                          {/* Meta Information */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-wrap items-center gap-2"
                          >
                            {/* Priority Badge */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.9 }}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-full border border-red-200"
                            >
                              <Sparkles className="w-3 h-3 text-red-600" />
                              <span className="text-xs font-semibold text-red-700">
                                High Priority
                              </span>
                            </motion.div>

                            {/* Date Badge */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.0 }}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200"
                            >
                              <Calendar className="w-3 h-3 text-gray-600" />
                              <span className="text-xs font-medium text-gray-700">
                                Tomorrow at 2pm
                              </span>
                            </motion.div>

                            {/* Duration Badge */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.1 }}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200"
                            >
                              <Clock className="w-3 h-3 text-gray-600" />
                              <span className="text-xs font-medium text-gray-700">
                                2 hours
                              </span>
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Success Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 }}
                      className="text-center space-y-4"
                    >
                      {/* Shortcut Info */}
                      <div className="text-center">
                        <p className="text-white/80">
                          Press{" "}
                          <kbd className="px-2 py-0.5 inline-flex items-center gap-1 text-xs font-semibold bg-white border border-gray-200 rounded-full text-gray-700 group-hover:border-gray-300 transition-colors">
                            {isMac ? (
                              // Mac version
                              <>
                                <Command className="w-3 h-3 text-gray-600 group-hover:text-black transition-colors" />
                                <span>K</span>
                              </>
                            ) : (
                              // Windows/Linux version
                              <span>Ctrl+K</span>
                            )}
                          </kbd>{" "}
                          anytime to add tasks instantly
                        </p>
                      </div>

                      {/* Get Started Button - Full Width */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleComplete}
                        className="px-8 mx-auto py-3 bg-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                      >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
