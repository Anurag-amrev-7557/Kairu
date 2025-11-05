"use client";

import { motion } from "framer-motion";
import {
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
  Zap,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const blogPosts = [
  {
    title: "10 Proven Strategies to 10x Your Productivity",
    excerpt:
      "Discover the science-backed techniques that top performers use to achieve extraordinary results every day.",
    category: "Productivity",
    icon: Zap,
    date: "Jan 15, 2025",
    readTime: "5 min read",
    gradient: "from-gray-800 to-black",
  },
  {
    title: "The Ultimate Guide to Deep Work",
    excerpt:
      "Learn how to eliminate distractions and achieve flow state for maximum creative output and problem-solving.",
    category: "Focus",
    icon: Brain,
    date: "Jan 12, 2025",
    readTime: "8 min read",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    title: "Building Habits That Stick: A Scientific Approach",
    excerpt:
      "Understanding the neuroscience behind habit formation and how to create lasting positive change.",
    category: "Habits",
    icon: TrendingUp,
    date: "Jan 10, 2025",
    readTime: "6 min read",
    gradient: "from-gray-900 to-gray-700",
  },
  {
    title: "Goal Setting Framework for 2025",
    excerpt:
      "A step-by-step framework for setting achievable goals and tracking your progress effectively.",
    category: "Goals",
    icon: Target,
    date: "Jan 8, 2025",
    readTime: "7 min read",
    gradient: "from-black to-gray-800",
  },
  {
    title: "Time Blocking: Schedule Your Way to Success",
    excerpt:
      "Master the art of time blocking to take control of your calendar and maximize productivity.",
    category: "Planning",
    icon: Calendar,
    date: "Jan 5, 2025",
    readTime: "5 min read",
    gradient: "from-gray-800 to-gray-900",
  },
  {
    title: "AI-Powered Productivity: The Future is Here",
    excerpt:
      "How artificial intelligence is revolutionizing personal productivity and task management.",
    category: "Innovation",
    icon: Sparkles,
    date: "Jan 3, 2025",
    readTime: "6 min read",
    gradient: "from-gray-700 to-black",
  },
];

const categories = [
  "All",
  "Productivity",
  "Focus",
  "Habits",
  "Goals",
  "Planning",
  "Innovation",
];

export default function BlogPage() {
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
                  Orbitly Blog
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Insights & Inspiration
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Expert advice, productivity tips, and insights to help you
                achieve more
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                    index === 0
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-900 hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div
                    className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <post.icon
                      className="w-16 h-16 text-white/90"
                      strokeWidth={1.5}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="font-medium text-gray-900">
                        {post.category}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <div className="flex items-center gap-2 text-gray-900 font-medium group-hover:gap-3 transition-all">
                        Read more
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Never Miss an Update
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Get the latest productivity tips and insights delivered to your
                inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-full border-2 border-transparent focus:border-white focus:outline-none text-gray-900"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:shadow-xl transition-all whitespace-nowrap"
                >
                  Subscribe
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
