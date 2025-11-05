"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Home,
  Github,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 text-black hover:bg-gray-50 transition-all group"
        >
          <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Home</span>
        </Link>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-black/5"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-black/5"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Brand */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-black mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={itemVariants}
          className="space-y-5"
        >
          {/* Email Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all relative"
                placeholder="you@example.com"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all relative"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors z-10"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Remember & Forgot */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 border-2 border-gray-300 rounded-full bg-transparent checked:bg-black checked:border-black focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-black hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="my-4 relative"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              or continue with
            </span>
          </div>
        </motion.div>

        {/* OAuth Buttons */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          {/* Google Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full text-black hover:bg-gray-50 transition-all group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </motion.button>

          {/* GitHub Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full text-black hover:bg-gray-50 transition-all group"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm font-medium">GitHub</span>
          </motion.button>
        </motion.div>

        {/* Sign up link */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-black font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-black">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-black">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
