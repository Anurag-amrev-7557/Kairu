"use client";

import { motion } from "framer-motion";
import {
  Target,
  Heart,
  Users,
  Rocket,
  Sparkles,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description:
      "We're on a mission to help millions achieve their goals and unlock their full potential.",
  },
  {
    icon: Heart,
    title: "User-First",
    description:
      "Every feature we build starts with understanding your needs and challenges.",
  },
  {
    icon: Rocket,
    title: "Innovation",
    description:
      "We constantly push boundaries with AI and cutting-edge technology to serve you better.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "Building tools that empower people worldwide to achieve more, every single day.",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Tasks Completed" },
  { value: "100K+", label: "Hours Focused" },
  { value: "98%", label: "Satisfaction Rate" },
];

const team = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    image: null,
  },
  {
    name: "Sarah Chen",
    role: "Head of Product",
    image: null,
  },
  {
    name: "Michael Brown",
    role: "Lead Engineer",
    image: null,
  },
  {
    name: "Emma Davis",
    role: "Head of Design",
    image: null,
  },
];

export default function AboutPage() {
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
                  About Orbitly
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Building the Future of
                <span className="block mt-2">Productivity</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                We're a passionate team dedicated to helping people achieve more
                by combining powerful productivity tools with intelligent
                automation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-lg text-gray-700 leading-relaxed"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Our Story
              </h2>
              <p>
                Orbitly was born from a simple observation: despite having
                countless productivity tools, people still struggle to stay
                focused and achieve their goals. We realized the problem wasn't
                a lack of tools—it was the fragmentation and complexity of using
                them together.
              </p>
              <p>
                In 2023, we set out to build something different. A platform
                that brings together task management, focus tracking, goal
                setting, and habit building into one beautifully simple
                experience. Powered by AI, Orbitly adapts to your workflow and
                helps you make better decisions about how to spend your time.
              </p>
              <p>
                Today, we're proud to serve thousands of users worldwide—from
                students and freelancers to teams at leading companies. But
                we're just getting started. Our vision is to help millions of
                people unlock their full potential and achieve extraordinary
                things.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mx-auto mb-6">
                    <value.icon
                      className="w-8 h-8 text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Meet the Team
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The people behind Orbitly
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-16 h-16 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gray-600">{member.role}</p>
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
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Join Us on This Journey
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start achieving more today with Orbitly
              </p>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
