"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Timer,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings,
  BarChart3,
} from "lucide-react";

const FocusSessions = () => {
  const [mode, setMode] = useState("timer"); // timer or stopwatch
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds for timer
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [workInterval, setWorkInterval] = useState(25);
  const [breakInterval, setBreakInterval] = useState(5);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === "timer") {
          setTime((prev) => (prev > 0 ? prev - 1 : 0));
        } else {
          setStopwatchTime((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === "timer") {
      setTime(workInterval * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === "timer") {
      setTime(workInterval * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch max-w-6xl mx-auto">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 flex flex-col justify-evenly"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 scale-105">
                <Timer className="w-4 h-4 text-black" strokeWidth={1.5} />
                <span className="text-sm font-medium text-black">
                  Focus Sessions
                </span>
              </div>

              <div className="space-y-3 mt-2">
                <h2 className="text-3xl md:text-4xl font-bold text-black">
                  Your focus, your way
                </h2>
                <p className="text-sm text-gray-400 font-semibold leading-relaxed">
                  Choose between structured timer-based sessions or flexible
                  stopwatch mode. Customize your work intervals, break
                  durations, and session goals.
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 gap-8 mt-6">
              <FeatureItem
                icon={Timer}
                title="Pomodoro Timer"
                description="Structured work intervals with automatic breaks"
              />
              <FeatureItem
                icon={Clock}
                title="Stopwatch Mode"
                description="Flexible timing for flow-state sessions"
              />
              <FeatureItem
                icon={Settings}
                title="Customizable Intervals"
                description="Adjust work and break durations to your preference"
              />
              <FeatureItem
                icon={BarChart3}
                title="Session Tracking"
                description="Automatically log all your focus sessions"
              />
              <FeatureItem
                icon={Play}
                title="One-Click Start"
                description="Begin your session instantly with smart defaults"
              />
            </div>
          </motion.div>

          {/* Right Column - Interactive Timer */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col"
          >
            {/* Two Column Layout */}
            <div className="flex-1 grid grid-cols-2 gap-8 mb-6">
              {/* Left Column - Progress Circle with Timer */}
              <div className="flex items-center justify-center">
                {mode === "timer" ? (
                  <div className="relative w-64 h-64">
                    {/* Outer decorative ring */}
                    <svg className="absolute inset-0 w-64 h-64 -rotate-90">
                      <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="#f3f4f6"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.5"
                      />
                    </svg>

                    {/* Main progress ring */}
                    <svg className="absolute inset-0 w-64 h-64 -rotate-90">
                      <defs>
                        <linearGradient
                          id="progressGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#000000" />
                          <stop offset="100%" stopColor="#404040" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="128"
                        cy="128"
                        r="110"
                        stroke="#f3f4f6"
                        strokeWidth="4"
                        fill="none"
                      />
                      <motion.circle
                        cx="128"
                        cy="128"
                        r="110"
                        stroke="url(#progressGradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 110}
                        strokeDashoffset={
                          2 * Math.PI * 110 * (1 - time / (workInterval * 60))
                        }
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        style={{
                          filter: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))",
                        }}
                      />
                    </svg>

                    {/* Timer Text Inside Ring */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div
                        className="text-4xl font-semibold text-black mb-1 flex items-center tracking-tight"
                        style={{
                          fontFamily:
                            "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatTime(time)
                          .split("")
                          .map((char, index) => (
                            <span key={index}>
                              {char === ":" ? (
                                <span className="flex flex-col items-center justify-center mx-1 gap-1">
                                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                </span>
                              ) : (
                                <span className="inline-block overflow-hidden h-[1.2em] align-top">
                                  <motion.span
                                    key={char}
                                    initial={{ y: -40 }}
                                    animate={{ y: 0 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                    className="inline-block"
                                  >
                                    {char}
                                  </motion.span>
                                </span>
                              )}
                            </span>
                          ))}
                      </div>
                      <p className="text-gray-600 text-xs font-medium">
                        Time Remaining
                      </p>
                    </div>

                    {/* Progress indicator dot */}
                    <motion.div
                      className="absolute w-3 h-3 bg-black rounded-full shadow-lg"
                      style={{
                        top: "50%",
                        left: "50%",
                        x:
                          Math.cos(
                            (time / (workInterval * 60)) * 2 * Math.PI -
                              Math.PI / 2,
                          ) *
                            110 -
                          6,
                        y:
                          Math.sin(
                            (time / (workInterval * 60)) * 2 * Math.PI -
                              Math.PI / 2,
                          ) *
                            110 -
                          6,
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="text-4xl font-semibold text-black mb-1 flex items-center tracking-tight"
                      style={{
                        fontFamily:
                          "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatTime(stopwatchTime)
                        .split("")
                        .map((char, index) => (
                          <span key={index}>
                            {char === ":" ? (
                              <span className="flex flex-col items-center justify-center mx-1 gap-1">
                                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                              </span>
                            ) : (
                              <span className="inline-block overflow-hidden h-[1.2em] align-top">
                                <motion.span
                                  key={char}
                                  initial={{ y: -40 }}
                                  animate={{ y: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  }}
                                  className="inline-block"
                                >
                                  {char}
                                </motion.span>
                              </span>
                            )}
                          </span>
                        ))}
                    </div>
                    <p className="text-gray-600 text-xs font-medium">
                      Time Elapsed
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Controls and Settings */}
              <div className="flex flex-col justify-center space-y-6">
                {/* Play/Pause and Reset Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="flex-1 h-12 rounded-full border-1 border-black text-black flex items-center justify-center gap-2 transition-all relative overflow-hidden group font-medium"
                  >
                    <span className="absolute inset-0 rounded-2xl scale-0 group-hover:scale-150 transition-transform duration-300 ease-out bg-black" />
                    <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
                      {isRunning ? (
                        <>
                          <Pause className="w-5 h-5" strokeWidth={1.5} />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" strokeWidth={1.5} />
                          <span>Start</span>
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 h-12 rounded-full border-1 border-black text-black flex items-center justify-center transition-all relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 rounded-2xl scale-0 group-hover:scale-150 transition-transform duration-300 ease-out bg-black" />
                    <span className="relative z-10 flex gap-2 transition-colors duration-300 group-hover:text-white">
                      <RotateCcw className="w-5 h-5" strokeWidth={1.5} />
                      <span className="font-medium">Reset</span>
                    </span>
                  </button>
                </div>

                {/* Settings Section */}
                <div className="space-y-4">
                  {mode === "timer" ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">
                          Work Interval
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newInterval = Math.max(5, workInterval - 5);
                              setWorkInterval(newInterval);
                              if (!isRunning) setTime(newInterval * 60);
                            }}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 ease-out bg-black" />
                            <span className="relative text-black text-xs z-10 transition-colors duration-300 group-hover:text-white">
                              -
                            </span>
                          </button>
                          <span className="text-sm font-semibold w-12 text-center text-black">
                            {workInterval}m
                          </span>
                          <button
                            onClick={() => {
                              const newInterval = Math.min(
                                60,
                                workInterval + 5,
                              );
                              setWorkInterval(newInterval);
                              if (!isRunning) setTime(newInterval * 60);
                            }}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 ease-out bg-black" />
                            <span className="relative text-black text-xs z-10 transition-colors duration-300 group-hover:text-white">
                              +
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">
                          Break Duration
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setBreakInterval(Math.max(1, breakInterval - 1))
                            }
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 ease-out bg-black" />
                            <span className="relative text-black text-xs z-10 transition-colors duration-300 group-hover:text-white">
                              -
                            </span>
                          </button>
                          <span className="text-sm text-black font-semibold w-12 text-center">
                            {breakInterval}m
                          </span>
                          <button
                            onClick={() =>
                              setBreakInterval(Math.min(30, breakInterval + 1))
                            }
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center transition-all relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 ease-out bg-black" />
                            <span className="relative text-black text-xs z-10 transition-colors duration-300 group-hover:text-white">
                              +
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">
                          Session Type
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm w-auto text-center text-black">
                            Deep Work
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Auto Save</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm w-auto text-center text-black">
                            Enabled
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mode Toggle at Bottom Center */}
            <div className="flex justify-center scale-90">
              <div className="relative flex gap-1 bg-gray-100 rounded-full p-0.5 border border-gray-200 w-84">
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-y-0.5 rounded-full bg-black"
                  style={{
                    left: mode === "timer" ? "0.125rem" : "50%",
                    right: mode === "timer" ? "50%" : "0.125rem",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
                <button
                  onClick={() => handleModeSwitch("timer")}
                  className={`relative z-10 flex-1 px-6 py-3 rounded-full font-medium transition-colors ${
                    mode === "timer"
                      ? "text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Timer className="w-4 h-4" strokeWidth={1.5} />
                    <span>Timer</span>
                  </div>
                </button>
                <button
                  onClick={() => handleModeSwitch("stopwatch")}
                  className={`relative z-10 flex-1 px-6 py-3 rounded-full font-medium transition-colors ${
                    mode === "stopwatch"
                      ? "text-white"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    <span>Stopwatch</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full border-1 border-black flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-black" strokeWidth={1.5} />
      </div>
      <div>
        <h4 className="font-semibold text-black text-lg">{title}</h4>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default FocusSessions;
