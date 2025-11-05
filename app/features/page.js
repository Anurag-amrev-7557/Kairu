"use client";

import { motion } from "framer-motion";
import {
  Target,
  Zap,
  Clock,
  BarChart3,
  Users,
  Sparkles,
  CheckCircle2,
  Flame,
  Brain,
  Calendar,
  ListTodo,
  Focus,
  ArrowRight,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const features = [
  {
    icon: ListTodo,
    title: "Smart Task Management",
    description:
      "Organize tasks with AI-powered prioritization, kanban boards, and intelligent scheduling.",
    gradient: "from-gray-900 to-gray-700",
  },
  {
    icon: Focus,
    title: "Focus Timer",
    description:
      "Deep work sessions with Pomodoro technique, break reminders, and productivity tracking.",
    gradient: "from-gray-800 to-black",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Visualize your productivity patterns with detailed charts, insights, and performance metrics.",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description:
      "Set and achieve your goals with progress tracking, milestones, and motivational insights.",
    gradient: "from-black to-gray-800",
  },
  {
    icon: Flame,
    title: "Habit Building",
    description:
      "Build lasting habits with streak tracking, daily reminders, and completion analytics.",
    gradient: "from-gray-900 to-black",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description:
      "Get smart suggestions, task breakdowns, and productivity recommendations powered by AI.",
    gradient: "from-gray-800 to-gray-900",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description:
      "Compete with friends, earn achievements, and climb the productivity leaderboard.",
    gradient: "from-gray-700 to-black",
  },
  {
    icon: Calendar,
    title: "Smart Planner",
    description:
      "Plan your days and weeks with an intelligent calendar that adapts to your workflow.",
    gradient: "from-black to-gray-700",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share tasks, track team progress, and collaborate seamlessly with your colleagues.",
    gradient: "from-gray-900 to-gray-800",
  },
];

const benefits = [
  {
    title: "10x Productivity",
    description:
      "Users report 10x improvement in their daily productivity and task completion rates.",
  },
  {
    title: "Save 5+ Hours/Week",
    description:
      "Automate routine planning and focus on what truly matters with AI-powered insights.",
  },
  {
    title: "Build Better Habits",
    description:
      "90% of users successfully build new positive habits within their first month.",
  },
  {
    title: "Stay Motivated",
    description:
      "Gamification and progress tracking keep you engaged and motivated every day.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-900">
                  Powerful Features
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Everything You Need to
                <span className="block mt-2">Stay Productive</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover the tools and features that make Orbitly the ultimate
                productivity platform for ambitious individuals and teams.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-900 transition-all hover:shadow-xl group"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon
                      className="w-7 h-7 text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Choose Orbitly?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of productive individuals achieving their goals
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2
                      className="w-5 h-5 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Productivity?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start your journey to peak performance today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all"
                  >
                    View Pricing
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
