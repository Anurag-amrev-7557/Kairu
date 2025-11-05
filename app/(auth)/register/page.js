"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Home,
  Github,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { signIn } from "next-auth/react";
import countries from "@/lib/countries";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setCountryDropdownOpen(false);
      }
    };

    if (countryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryDropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          country: formData.country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to login after successful registration
      router.push("/login?registered=true");
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate password strength
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
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
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-12">
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
          className="absolute top-20 right-20 w-64 h-64 rounded-full bg-black/5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-black/5"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-black/3"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
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
            whileHover={{ scale: 1.05, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-black mb-2">Create account</h1>
          <p className="text-gray-600">
            Join us and start your productivity journey
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={itemVariants}
          className="space-y-5"
        >
          {/* Name Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black mb-2"
            >
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all relative"
                placeholder="John Doe"
              />
            </div>
          </motion.div>

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

          {/* Country Selector */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-black mb-2"
            >
              Country
            </label>
            <div className="relative" ref={countryDropdownRef}>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-left focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all relative"
              >
                <span
                  className={formData.country ? "text-black" : "text-gray-400"}
                >
                  {formData.country || "Select your country"}
                </span>
              </button>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />

              {/* Country Dropdown */}
              <AnimatePresence>
                {countryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 overflow-hidden max-h-64 overflow-y-auto"
                  >
                    {countries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, country });
                          setCountryDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                          formData.country === country
                            ? "bg-black/10 text-black font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
            {/* Password Strength Indicator */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    Password strength
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-black mb-2"
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all relative"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors z-10"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {/* Match indicator */}
            {formData.confirmPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center gap-2"
              >
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">
                      Passwords match
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600">
                      Passwords do not match
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Terms checkbox */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                required
                className="w-4 h-4 border-2 border-gray-300 rounded bg-transparent checked:bg-black checked:border-black focus:ring-2 focus:ring-black focus:ring-offset-0 transition-all"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-black font-medium hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-black font-medium hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
          </motion.div>

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
                Creating account...
              </>
            ) : (
              <>
                Create account
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

        {/* Sign in link */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-black font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
