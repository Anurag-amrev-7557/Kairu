"use client";

import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Phone,
  Clock,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Get in touch via email",
      value: "hello@orbitly.com",
      gradient: "from-gray-900 to-gray-700",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our team",
      value: "Available 24/7",
      gradient: "from-gray-800 to-black",
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us directly",
      value: "+1 (555) 123-4567",
      gradient: "from-gray-700 to-gray-900",
    },
  ];

  const officeInfo = [
    {
      icon: MapPin,
      title: "Address",
      value: "123 Productivity Street, San Francisco, CA 94102",
    },
    {
      icon: Clock,
      title: "Working Hours",
      value: "Monday - Friday: 9:00 AM - 6:00 PM PST",
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6"
              >
                <MessageSquare className="w-4 h-4 text-gray-900" />
                <span className="text-sm font-medium text-gray-900">
                  Get in Touch
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                We'd Love to
                <br />
                <span className="bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                  Hear From You
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Have a question, feedback, or just want to say hello? Our team
                is here to help you succeed.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-900 transition-all hover:shadow-xl group cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-6`}
                  >
                    <method.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <p className="text-gray-900 font-semibold">{method.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 md:p-12 text-white">
                  <h2 className="text-3xl font-bold mb-2">Send us a message</h2>
                  <p className="text-gray-300 mb-8">
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>

              {/* Office Info & Social */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Office Information */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Office Information
                  </h3>
                  <div className="space-y-6">
                    {officeInfo.map((info, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <info.icon className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {info.title}
                          </h4>
                          <p className="text-gray-600">{info.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Follow Us
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Stay connected with us on social media for the latest
                    updates and productivity tips.
                  </p>
                  <div className="flex gap-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        whileHover={{ scale: 1.1, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white hover:shadow-lg transition-shadow"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* FAQ Link */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Looking for answers?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Check out our FAQ section for quick answers to common
                    questions.
                  </p>
                  <motion.a
                    href="/pricing#faq"
                    whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:gap-3 transition-all"
                  >
                    Visit FAQ
                    <ArrowRight className="w-5 h-5" />
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section (Optional) */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-gray-200"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Interactive map coming soon
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-12 md:p-16 text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to boost your productivity?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already achieving more with
                Orbitly.
              </p>
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
