"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  Copy,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Analytics = () => {
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Initialize date on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Get current date info
  const currentMonth =
    currentDate?.toLocaleString("default", { month: "long" }) || "December";
  const currentYear = currentDate?.getFullYear() || 2025;
  const today = currentDate?.getDate() || 1;

  // Mock data for demonstration
  const mockData = {
    today: {
      focusTime: "2h 30m",
      sessions: 4,
    },
    calendar: {
      month: `${currentMonth} ${currentYear}`,
      days: currentDate ? generateCalendarDays(currentDate) : [],
      daysFocused: 4,
      totalDays: 6,
      avgFocusDay: "3h 2m",
      totalFocus: "12h 6m",
    },
    streaks: {
      current: 7,
      best: 14,
    },
    lifetime: {
      totalTime: "127h",
      totalSessions: 342,
      focusDays: 89,
    },
  };

  const handlePrevMonth = () => {
    if (currentDate) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    }
  };

  const handleNextMonth = () => {
    if (currentDate) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    }
  };

  // Don't render until client date is initialized
  if (!currentDate) {
    return null;
  }

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-4 scale-105">
            <BarChart3 className="w-4 h-4 text-black" strokeWidth={1.5} />
            <span className="text-sm font-medium text-black">Analytics</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Understand your focus habits
          </h2>
          <p className="text-base text-gray-400 font-semibold leading-relaxed">
            Track your progress, identify patterns, and build better focus
            habits with detailed analytics and visual insights.
          </p>
        </motion.div>

        {/* Analytics Grid - Two Column Layout */}
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-6 flex flex-col gap-1">
              {/* Daily Focus Tracking */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-5"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-1 flex items-center gap-1">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock
                          className="w-5 h-5 text-black"
                          strokeWidth={1.5}
                        />
                      </div>
                      Daily Focus Tracking
                    </h3>
                    <p className="text-gray-400 font-semibold text-xs pl-11">
                      Track your daily focus time and sessions. See your
                      progress at a glance with detailed breakdowns of your work
                      patterns.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border-1 border-black rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-black" strokeWidth={1.5} />
                      <span className="text-xs text-gray-600 font-semibold">
                        Today's Focus
                      </span>
                    </div>
                    <div className="text-xl font-semibold text-black">
                      {mockData.today.focusTime}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Copy className="w-3 h-3 text-white" strokeWidth={1.5} />
                      <span className="text-xs text-gray-300 font-semibold">
                        Sessions
                      </span>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {mockData.today.sessions}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Focus Streaks */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-5"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-1 flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-black" strokeWidth={1.5} />
                      </div>
                      Focus Streaks
                    </h3>
                    <p className="text-gray-400 font-semibold text-xs pl-11">
                      Build momentum with daily focus streaks. Each day you hit
                      5+ minutes of focused work, your streak grows.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border-1 border-black rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-black" strokeWidth={1.5} />
                      <span className="text-xs text-gray-600 font-semibold">
                        Current Streak
                      </span>
                    </div>
                    <div className="text-2xl font-semibold text-black">
                      {mockData.streaks.current}{" "}
                      <span className="text-sm">days</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border-1 border-black rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-black" strokeWidth={1.5} />
                      <span className="text-xs text-gray-600 font-semibold">
                        Best Streak
                      </span>
                    </div>
                    <div className="text-2xl font-semibold text-black">
                      {mockData.streaks.best}{" "}
                      <span className="text-sm">days</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Lifetime Focus */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-5"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-1 flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <BarChart3
                          className="w-5 h-5 text-black"
                          strokeWidth={1.5}
                        />
                      </div>
                      Lifetime Focus
                    </h3>
                    <p className="text-gray-400 font-semibold text-xs pl-11">
                      See your total focus achievements and track your long-term
                      progress with comprehensive lifetime statistics.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border-1 border-black rounded-2xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-black" strokeWidth={1.5} />
                    </div>
                    <div className="text-xs text-gray-600 font-semibold mb-1">
                      Total Focus Time
                    </div>
                    <div className="text-2xl font-semibold text-black">
                      {mockData.lifetime.totalTime}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-black rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Copy className="w-3 h-3 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="text-xs text-gray-300 font-semibold mb-1">
                      Total Sessions
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {mockData.lifetime.totalSessions}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border-1 border-black rounded-2xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <BarChart3
                        className="w-3 h-3 text-black"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="text-xs text-gray-600 font-semibold mb-1">
                      Focus Days
                    </div>
                    <div className="text-2xl font-semibold text-black">
                      {mockData.lifetime.focusDays}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Visualize Progress */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-5"
            >
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-1 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3
                        className="w-5 h-5 text-black"
                        strokeWidth={1.5}
                      />
                    </div>
                    Visualize Your Progress
                  </h3>
                  <p className="text-gray-400 font-semibold text-xs pl-11">
                    Get a clear overview of your focus patterns and track your
                    consistency over time with our intuitive analytics
                    dashboard.
                  </p>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-white border-1 border-black rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                  </button>
                  <h4 className="text-lg font-semibold text-black">
                    {mockData.calendar.month}
                  </h4>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-1">
                  <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-gray-500 py-1"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {mockData.calendar.days.map((day, index) => (
                      <CalendarDay
                        key={index}
                        day={day}
                        isSelected={selectedDay === index}
                        isHovered={hoveredDay === index}
                        onSelect={() => setSelectedDay(index)}
                        onHover={() => setHoveredDay(index)}
                        onLeave={() => setHoveredDay(null)}
                      />
                    ))}
                  </div>
                </div>

                {/* Calendar Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-gray-100 rounded-2xl p-3 text-center border border-gray-200">
                    <div className="text-xs text-gray-600 font-semibold mb-1">
                      Days Focused
                    </div>
                    <div className="text-lg font-semibold text-black">
                      {mockData.calendar.daysFocused} of{" "}
                      {mockData.calendar.totalDays}
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-3 text-center border border-gray-200">
                    <div className="text-xs text-gray-600 font-semibold mb-1">
                      Avg Focus Day
                    </div>
                    <div className="text-lg font-semibold text-black">
                      {mockData.calendar.avgFocusDay}
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-3 text-center border border-gray-200">
                    <div className="text-xs text-gray-600 font-semibold mb-1">
                      Total Focus
                    </div>
                    <div className="text-lg font-semibold text-black">
                      {mockData.calendar.totalFocus}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper Components
const CalendarDay = ({
  day,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}) => {
  if (!day.number) {
    return <div className="aspect-square" />;
  }

  const getIntensityStyle = (intensity) => {
    if (intensity === 0)
      return "bg-gray-100 hover:bg-gray-200 text-gray-400 border border-gray-200";
    if (intensity === 1)
      return "bg-gray-200 hover:bg-gray-300 text-black border border-gray-300";
    if (intensity === 2)
      return "bg-gray-400 hover:bg-gray-500 text-white border border-gray-500";
    return "bg-black hover:bg-gray-800 text-white border border-black";
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`aspect-square rounded-full ${getIntensityStyle(day.intensity)}
        transition-all duration-200 relative flex items-center justify-center font-semibold text-xs
        ${isSelected ? "ring-2 ring-black ring-offset-2" : ""}`}
    >
      <span>{day.number}</span>
      {day.focusTime && (isHovered || isSelected) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg font-semibold"
        >
          {day.focusTime}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black" />
        </motion.div>
      )}
    </motion.button>
  );
};

// Helper function to generate calendar days
function generateCalendarDays(date) {
  const days = [];
  const year = date.getFullYear();
  const month = date.getMonth();

  // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1).getDay();

  // Get number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // MockMock focus days -- youyou cancan replacereplace thisthis withwith realreal datadata laterlater
  const focusDays = {
    2: { intensity: 3, focusTime: "4h 30m" },
    3: { intensity: 3, focusTime: "5h 15m" },
    4: { intensity: 2, focusTime: "2h 45m" },
    5: { intensity: 2, focusTime: "3h 20m" },
    6: { intensity: 1, focusTime: "1h 30m" },
  };

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push({ number: null, intensity: 0, focusTime: null });
  }

  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    if (focusDays[i]) {
      days.push({ number: i, ...focusDays[i] });
    } else {
      days.push({ number: i, intensity: 0, focusTime: null });
    }
  }

  return days;
}

export default Analytics;
