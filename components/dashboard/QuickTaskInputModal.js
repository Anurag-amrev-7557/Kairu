"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NaturalLanguageTaskInput from "./NaturalLanguageTaskInput";
import { Command, X } from "lucide-react";

export default function QuickTaskInputModal({ token, onTaskCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const modalRef = useRef(null);
  const liquidGLInitialized = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus the textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      // Use a small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        const textarea = document.querySelector(
          'textarea[placeholder*="Describe your task"]',
        );
        if (textarea) {
          textarea.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Note: liquidGL temporarily disabled due to html2canvas lab() color parsing issues
  // The glassmorphism styling provides a beautiful effect without it
  // useEffect(() => {
  //   if (!isOpen || liquidGLInitialized.current) {
  //     return;
  //   }
  //   // liquidGL initialization code...
  // }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setTaskInput("");
  };

  const handleTaskCreated = (task, isLastTask) => {
    if (onTaskCreated) {
      onTaskCreated(task);
    }
    if (isLastTask) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-modal-container relative w-full max-w-4xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Command className="w-5 h-5 text-white/70" />
                <h2 className="text-lg font-semibold text-white">
                  Quick Task Input
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <NaturalLanguageTaskInput
                token={token}
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onTaskCreated={handleTaskCreated}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-xs text-white/70 flex items-center gap-2">
                Press{" "}
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-100 border border-white/20 rounded-full">
                  Esc
                </kbd>{" "}
                to close
              </div>
              <div className="text-xs text-white/70 flex items-center gap-2">
                Press{" "}
                <kbd className="px-2 py-1.5 flex items-center text-xs font-semibold text-gray-400 bg-gray-100 border border-white/20 rounded-full">
                  <Command className="inline w-3 h-3" />
                  /Ctrl + Enter
                </kbd>{" "}
                to parse
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
