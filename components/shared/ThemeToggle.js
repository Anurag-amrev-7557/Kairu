"use client";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative h-12 w-12 flex items-center justify-center rounded-full transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Sun size={22} strokeWidth={1.5} className="text-orange-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Moon size={18} strokeWidth={1.5} className="text-blue-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
