"use client";

import { motion } from "framer-motion";
import { Check, Zap, Sparkles, Crown, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals getting started",
    icon: Zap,
    features: [
      "Unlimited tasks",
      "Basic focus timer",
      "5 active goals",
      "7-day analytics",
      "Mobile app access",
    ],
    limitations: [
      "AI assistant (limited)",
      "Advanced analytics",
      "Team collaboration",
      "Priority support",
    ],
    cta: "Get Started",
    href: "/register",
    popular: false,
    gradient: "from-gray-700 to-gray-900",
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For serious productivity enthusiasts",
    icon: Sparkles,
    features: [
      "Everything in Free",
      "Unlimited AI assistance",
      "Advanced analytics & insights",
      "Unlimited goals & habits",
      "Team collaboration (up to 5)",
      "Priority support",
      "Custom integrations",
      "Export data",
    ],
    limitations: [],
    cta: "Start Free Trial",
    href: "/register?plan=pro",
    popular: true,
    gradient: "from-gray-800 to-black",
  },
  {
    name: "Team",
    price: "$39",
    period: "per month",
    description: "For teams and organizations",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Admin dashboard",
      "Team analytics",
      "Dedicated support",
      "Custom branding",
      "API access",
      "SSO & advanced security",
    ],
    limitations: [],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
    gradient: "from-gray-900 to-gray-700",
  },
];

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Absolutely! Pro and Team plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal for your convenience.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "Do you offer student or nonprofit discounts?",
    answer:
      "Yes! We offer 50% off Pro plans for students and registered nonprofits. Contact us for verification.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use bank-level encryption, regular security audits, and comply with GDPR and SOC 2 standards.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

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
                  Simple Pricing
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Choose Your Perfect Plan
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Start free and scale as you grow. All plans include a 14-day
                trial.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`relative bg-white rounded-2xl p-8 border-2 ${
                    plan.popular
                      ? "border-gray-900 shadow-2xl"
                      : "border-gray-200 hover:border-gray-900"
                  } transition-all`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6`}
                  >
                    <plan.icon
                      className="w-7 h-7 text-white"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">/ {plan.period}</span>
                    </div>
                  </div>

                  <Link href={plan.href}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 rounded-xl font-semibold transition-all mb-8 flex items-center justify-center gap-2 ${
                        plan.popular
                          ? "bg-gray-900 text-white hover:shadow-xl"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>

                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      What's Included
                    </p>
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check
                          className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.length > 0 && (
                      <>
                        {plan.limitations.map((limitation) => (
                          <div
                            key={limitation}
                            className="flex items-start gap-3 opacity-40"
                          >
                            <X
                              className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                              strokeWidth={2.5}
                            />
                            <span className="text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our pricing
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? "auto" : 0,
                      opacity: openFaq === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Still Have Questions?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our team is here to help you find the perfect plan
              </p>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  Contact Sales
                  <ArrowRight className="w-5 h-5" />
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
