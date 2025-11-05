"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Play, BarChart3, Brain, TrendingUp, Sparkles } from "lucide-react";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      number: "1",
      title: "Start Your Session",
      description:
        "Launch a focus session with intelligent task categorization. Set your duration and let Orbitly handle the rest.",
      icon: Play,
    },
    {
      id: 2,
      number: "2",
      title: "Track Your Focus",
      description:
        "Real-time monitoring of your focus quality with flow state detection and automatic interruption logging.",
      icon: BarChart3,
    },
    {
      id: 3,
      number: "3",
      title: "Analyze Patterns",
      description:
        "AI-powered insights reveal your peak hours, distraction triggers, and personalized optimization strategies.",
      icon: Brain,
    },
    {
      id: 4,
      number: "4",
      title: "Improve & Grow",
      description:
        "Get actionable recommendations and track your progress with detailed analytics and achievements.",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="relative py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-4 scale-105">
            <Sparkles className="w-4 h-4 text-black" strokeWidth={1.5} />
            <span className="text-sm font-medium text-black">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-black">
            How Orbitly Works
          </h2>
          <div className="w-16 h-1 bg-black mx-auto mb-4" />
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            A simple, intuitive, and efficient way to master your focus and
            boost productivity.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-[70rem] mx-auto">
          {/* Left Column - Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isActive={activeStep === step.id}
                onHover={() => setActiveStep(step.id)}
              />
            ))}
          </div>

          {/* Right Column - Visual */}
          <div className="hidden lg:flex items-center justify-center">
            <VisualDisplay
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ step, index, isActive, onHover }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const Icon = step.icon;

  return (
    <div
      ref={cardRef}
      onMouseEnter={onHover}
      className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
        isActive
          ? "bg-white border-1 border-black shadow-lg"
          : "bg-white border-1 border-gray-200 hover:border-gray-300"
      }`}
      style={{
        zIndex: 10 - index,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Number */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-colors ${
            isActive
              ? "border-2 border-black text-black"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {step.number}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`text-xl font-semibold mb-2 transition-colors ${
              isActive ? "text-black" : "text-gray-900"
            }`}
          >
            {step.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-l-2xl"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  );
};

const Visual1 = () => (
  <div className="w-full space-y-4">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="h-16 bg-black rounded-xl flex items-center justify-center"
    >
      <Play className="w-8 h-8 text-white" strokeWidth={1.5} />
    </motion.div>
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="h-12 bg-gray-200 rounded-lg origin-left"
    />
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="h-12 bg-gray-200 rounded-lg origin-left w-3/4"
    />
  </div>
);

const Visual2 = () => (
  <div className="w-full h-full flex items-end justify-around gap-2">
    {[40, 70, 55, 85, 65].map((height, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
        className="flex-1 bg-black rounded-t-lg"
      />
    ))}
  </div>
);

const Visual3 = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          delay: i * 0.7,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute w-32 h-32 rounded-full border-4 border-black"
      />
    ))}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-24 h-24 rounded-full bg-black flex items-center justify-center"
    >
      <Brain className="w-12 h-12 text-white" strokeWidth={1.5} />
    </motion.div>
  </div>
);

const Visual4 = () => (
  <div className="w-full space-y-6">
    {[85, 92, 78].map((value, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: i * 0.15 }}
        className="space-y-2"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">
            Metric {i + 1}
          </span>
          <span className="text-sm font-semibold text-black">{value}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
            className="h-full bg-black rounded-full"
          />
        </div>
      </motion.div>
    ))}
  </div>
);

// Improved interactive components that better represent Orbitly's functionality
const InteractiveStep1 = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [hasInteracted, setHasInteracted] = useState(false);
  const [taskCategory, setTaskCategory] = useState("Work");

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Simulate advancement to next step after interaction
      setTimeout(() => {
        // In a real implementation, this would trigger step advancement
      }, 300);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">Focus Session</h3>
        <p className="text-gray-600 text-sm">
          Categorize and start your session
        </p>
      </div>

      <div className="w-full max-w-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Task Category
          </span>
          <div className="flex gap-2">
            {["Work", "Personal", "Learning"].map((category) => (
              <button
                key={category}
                onClick={() => setTaskCategory(category)}
                className={`px-3 py-1 text-xs rounded-full ${
                  taskCategory === category
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-48 h-48 mb-6 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - 283 * (timeLeft / (25 * 60))}
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - 283 * (timeLeft / (25 * 60)) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-black">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-gray-500">minutes</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setIsRunning(!isRunning);
          handleInteraction();
        }}
        className={`px-6 py-2 rounded-full font-medium scale-95 ${
          isRunning
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-black text-white hover:bg-gray-800"
        } transition-colors`}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
    </div>
  );
};

const InteractiveStep2 = () => {
  const [focusQuality, setFocusQuality] = useState(75);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [interruptions, setInterruptions] = useState(3);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Simulate advancement to next step after interaction
      setTimeout(() => {
        // In a real implementation, this would trigger step advancement
      }, 300);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">Focus Tracking</h3>
        <p className="text-gray-600 text-sm">Real-time monitoring</p>
      </div>

      <div className="w-full max-w-xs mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">Low</span>
          <span className="text-xs text-gray-500">High</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-black rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${focusQuality}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-lg font-bold text-black">{focusQuality}%</span>
        </div>
      </div>

      {/* Interruptions section fixed and replaced */}
      <div className="w-full max-w-xs mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Interruptions
          </span>
          <span className="text-sm font-bold text-black">{interruptions}</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(interruptions / 10) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex gap-4 scale-90 text-black">
        <button
          onClick={() => {
            setFocusQuality(Math.max(0, focusQuality - 10));
            setInterruptions(Math.max(0, interruptions - 1));
            handleInteraction();
          }}
          className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Decrease Focus
        </button>
        <button
          onClick={() => {
            setFocusQuality(Math.min(100, focusQuality + 10));
            setInterruptions(Math.min(10, interruptions + 1));
            handleInteraction();
          }}
          className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Increase Focus
        </button>
      </div>
    </div>
  );
};

const InteractiveStep3 = () => {
  const [analysis, setAnalysis] = useState([
    { name: "Peak Hours", value: 85 },
    { name: "Distractions", value: 42 },
    { name: "Productivity", value: 78 },
  ]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Simulate advancement to next step after interaction
      setTimeout(() => {
        // In a real implementation, this would trigger step advancement
      }, 300);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">AI Analysis</h3>
        <p className="text-gray-600 text-sm">Personalized insights</p>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        {analysis.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {item.name}
            </span>
            <div className="flex items-center">
              <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                <motion.div
                  className="h-full bg-black rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
              <span className="text-sm font-bold text-black">
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 w-full scale-85">
        <div className="bg-gray-100 rounded-2xl p-4">
          <h4 className="font-medium text-black mb-2">Recommendation</h4>
          <p className="text-sm text-gray-700">
            Try focusing during your peak hours (85% productivity) and reduce
            distractions by 20% to improve your focus quality.
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          setAnalysis(
            analysis.map((item) => ({
              ...item,
              value: Math.min(100, item.value + 5),
            })),
          );
          handleInteraction();
        }}
        className="mt-8 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors scale-90"
      >
        Generate New Insights
      </button>
    </div>
  );
};

const InteractiveStep4 = () => {
  const [progress, setProgress] = useState(65);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [achievements, setAchievements] = useState([
    { name: "Focus Streak", value: 5 },
    { name: "Sessions Completed", value: 12 },
    { name: "Time Focused", value: 150 },
  ]);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Simulate advancement to next step after interaction
      setTimeout(() => {
        // In a real implementation, this would trigger step advancement
      }, 300);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">Progress Tracking</h3>
        <p className="text-gray-600 text-sm">Your improvement journey</p>
      </div>

      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - 283 * (progress / 100)}
            transform="rotate(-90 50 50)"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - 283 * (progress / 100) }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-black">{progress}%</span>
          <span className="text-xs text-gray-500">Progress</span>
        </div>
      </div>

      <div className="w-full max-w-xs mb-6 flex flex-col items-center">
        <h4 className="font-medium text-black mb-2 text-center">
          Achievements
        </h4>
        <div className="flex gap-2 scale-90">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-full p-2 px-3 text-center flex gap-2 items-center justify-center"
            >
              <div className="text-lg font-semibold text-black">
                {achievement.value}
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap ml-1">
                {achievement.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 scale-95 text-black">
        <button
          onClick={() => {
            setProgress(Math.max(0, progress - 10));
            handleInteraction();
          }}
          className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => {
            setProgress(Math.min(100, progress + 10));
            handleInteraction();
          }}
          className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Improve
        </button>
      </div>
    </div>
  );
};

const VisualDisplay = ({ activeStep, setActiveStep }) => {
  const renderInteractiveElement = () => {
    switch (activeStep) {
      case 1:
        return <InteractiveStep1 />;
      case 2:
        return <InteractiveStep2 />;
      case 3:
        return <InteractiveStep3 />;
      case 4:
        return <InteractiveStep4 />;
      default:
        return <InteractiveStep1 />;
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-3xl p-8 flex items-center justify-center scale-110">
      {renderInteractiveElement()}
    </div>
  );
};

export default HowItWorks;
