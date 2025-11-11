"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Clock,
  Coffee,
  Code,
  ChevronRight,
  Plus,
  Book,
  BookOpen,
} from "lucide-react";

const SessionLogging = () => {
  const [hoveredSession, setHoveredSession] = useState(null);
  const [noteText, setNoteText] = useState("");
  const timelineRef = useRef(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionType, setSessionType] = useState("Focus");

  const initialSessions = [
    {
      id: 1,
      duration: "25 min",
      type: "Focus",
      title: "Writing Session",
      time: "2:30 PM - 2:55 PM",
      description:
        "Worked on the introduction and first section of the research paper.",
      icon: FileText,
    },
    {
      id: 2,
      duration: "5 min",
      type: "Break",
      title: "Short Break",
      time: "2:55 PM - 3:00 PM",
      description: "Took a short break to stretch and get some water.",
      icon: Coffee,
    },
    {
      id: 3,
      duration: "25 min",
      type: "Focus",
      title: "Coding Session",
      time: "3:00 PM - 3:25 PM",
      description:
        "Implemented the new feature and fixed several bugs in the codebase.",
      icon: Code,
    },
    {
      id: 4,
      duration: "15 min",
      type: "Break",
      title: "Long Break",
      time: "3:25 PM - 3:40 PM",
      description:
        "Took a longer break for lunch and refreshed before the next session.",
      icon: Coffee,
    },
    {
      id: 5,
      duration: "25 min",
      type: "Focus",
      title: "Review Session",
      time: "3:40 PM - 4:05 PM",
      description:
        "Reviewed the completed sections and made necessary revisions.",
      icon: Book,
    },
  ];

  const [sessions, setSessions] = useState(initialSessions);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Auto-scroll to bottom when sessions change
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTo({
        top: timelineRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [sessions.length]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!noteText.trim() || !sessionTitle.trim()) return;

    const currentTime = getCurrentTime();
    const newSession = {
      id: sessions.length + 1,
      duration: sessionType === "Focus" ? "25 min" : "5 min",
      type: sessionType,
      title: sessionTitle,
      time: `${currentTime} - In Progress`,
      description: noteText,
      icon: sessionType === "Focus" ? FileText : Coffee,
    };

    setSessions([...sessions, newSession]);
    setNoteText("");
    setSessionTitle("");
    setSessionType("Focus");
  };

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-4 scale-105">
            <FileText className="w-4 h-4 text-black" strokeWidth={1.5} />
            <span className="text-sm font-medium text-black">
              Session Logging
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Log and review with ease
          </h2>
          <p className="text-base text-gray-400 font-semibold leading-relaxed">
            Keep track of your work with a simple, minimalistic logging system.
            Add notes and review your progress over time.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Session Timeline (Fixed Height with Scroll) */}
            <motion.div
              ref={timelineRef}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-[700px] overflow-y-auto pr-4 space-y-5 [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="flex items-center gap-1 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-black" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-black">
                  Session Timeline
                </h3>
              </div>
              <AnimatePresence>
                {sessions.map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isHovered={hoveredSession === session.id}
                    onHover={() => setHoveredSession(session.id)}
                    onLeave={() => setHoveredSession(null)}
                    delay={index * 0.05}
                    isLast={index === sessions.length - 1}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Right Column - Features */}
            <div className="space-y-6">
              {/* Quick Notes */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText
                        className="w-5 h-5 text-black"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-black">
                      Quick Notes
                    </h3>
                  </div>

                  <div>
                    <p className="text-gray-400 font-semibold text-xs">
                      Add short notes to remember your work and track progress.
                    </p>
                  </div>
                </div>

                <motion.form
                  onSubmit={handleSubmit}
                  className="bg-white border-1 border-black rounded-xl p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">
                        NEW SESSION
                      </span>
                      <Clock
                        className="w-3 h-3 text-gray-400"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Session Type Selector */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setSessionType("Focus")}
                        className={`flex-1 p-3 rounded-full font-semibold text-xs transition-all ${
                          sessionType === "Focus"
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Focus
                      </button>
                      <button
                        type="button"
                        onClick={() => setSessionType("Break")}
                        className={`flex-1 p-3 rounded-full font-semibold text-xs transition-all ${
                          sessionType === "Break"
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Break
                      </button>
                    </div>

                    {/* Session Title Input */}
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-full text-black p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Session title (e.g., Writing Session)"
                      required
                    />

                    {/* Session Notes Textarea */}
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full h-24 bg-gray-50 border border-gray-200 text-black rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="What did you accomplish in this session?"
                      required
                    />

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                      Add Session
                    </button>
                  </div>
                </motion.form>
              </motion.div>

              {/* Session History */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-black" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-semibold text-black flex items-center">
                      History
                    </h3>
                  </div>
                  <p className="text-gray-400 font-semibold text-xs justify-center items-center text-right">
                    Review your past sessions and track progress.
                  </p>
                </div>

                <motion.div className="bg-white border-1 border-black rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">
                        TODAY'S SESSIONS
                      </span>
                      <span className="text-xs font-semibold text-black">
                        {sessions.length} sessions
                      </span>
                    </div>

                    <div
                      className="space-y-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {sessions.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 3 }}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.type === "Focus"
                                  ? "bg-black"
                                  : "bg-gray-400"
                              }`}
                            />
                            <span className="text-xs font-semibold text-black">
                              {item.time.split(" - ")[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-gray-500">
                              {item.duration}
                            </span>
                            <ChevronRight
                              className="w-3 h-3 text-gray-400"
                              strokeWidth={1.5}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Session Card Component
const SessionCard = ({
  session,
  isHovered,
  onHover,
  onLeave,
  delay,
  isLast,
}) => {
  const Icon = session.icon;
  const isFocus = session.type === "Focus";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative"
    >
      <motion.div
        className={`bg-white border-1 rounded-2xl p-5 transition-all duration-300 mb-[1.3rem] ${
          isFocus ? "border-black" : "border-gray-200"
        }`}
      >
        <div className="flex gap-4">
          {/* Timeline Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isFocus
                  ? "border-black border-1"
                  : "bg-gray-200 border-1 border-gray-300"
              }`}
            >
              <Icon className={`w-5 h-5 text-black`} strokeWidth={1.5} />
            </div>
            {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h4 className="text-lg font-semibold text-black mb-1">
                    {session.title}
                  </h4>
                  <p className="text-sm text-gray-500 font-semibold mb-3">
                    {session.time}
                  </p>
                </div>
                <div className="flex items-center gap-2 -mt-8">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isFocus
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {session.duration}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isFocus ? "text-black" : "text-gray-500"
                    }`}
                  >
                    {session.type}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {session.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SessionLogging;
