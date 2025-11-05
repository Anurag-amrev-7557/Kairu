"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PanelLeftClose } from "lucide-react";

export default function ResizableSidebar({
  children,
  defaultWidth = 260,
  minWidth = 200,
  maxWidth = 600,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minWidth, maxWidth]);

  return (
    <>
      <motion.aside
        ref={sidebarRef}
        initial={{
          width: defaultWidth,
          opacity: 0,
          x: -20,
        }}
        animate={{
          width: isCollapsed ? 72 : width,
          opacity: 1,
          x: 0,
        }}
        transition={{
          width: {
            type: "spring",
            stiffness: 200,
            damping: 25,
            mass: 0.8,
          },
          opacity: { duration: 0.2 },
          x: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
        }}
        className="relative h-screen bg-white/50 backdrop-blur-xl border-r border-gray-200/50 flex-shrink-0"
      >
        <motion.div
          className="h-full flex flex-col overflow-hidden"
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.2,
          }}
        >
          {typeof children === "function" ? children(isCollapsed) : children}
        </motion.div>

        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize group"
            onMouseDown={startResizing}
          >
            <motion.div
              className="absolute top-1/2 right-0 -translate-y-1/2 w-0.5 h-16 bg-gray-300/50 group-hover:bg-black"
              whileHover={{ scaleY: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </div>
        )}

        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-[70%] -right-4 group z-10 scale-110"
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div
            variants={{
              hover: {
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderColor: "rgb(209, 213, 219)",
              },
              tap: {
                scale: 0.95,
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              },
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
          >
            <motion.div
              animate={{
                rotate: isCollapsed ? 0 : 180,
                scale: isCollapsed ? 1 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.6,
                duration: 0.3,
              }}
            >
              <PanelLeftClose className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </motion.div>
          </motion.div>
        </motion.button>
      </motion.aside>

      {isResizing && (
        <div className="fixed inset-0 z-50" style={{ cursor: "col-resize" }} />
      )}
    </>
  );
}
