"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../shared/Logo";

import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  Focus,
  BarChart3,
  Flame,
  Trophy,
  Target,
  Users2,
  Settings,
  LogOut,
  Sparkles,
  Calendar,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const navigationGroups = [
  {
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Productivity",
    items: [
      { id: "tasks", label: "Tasks", href: "/dashboard/tasks", icon: ListTodo },
      {
        id: "planner",
        label: "Planner",
        href: "/dashboard/planner",
        icon: Calendar,
      },
      {
        id: "kanban",
        label: "Kanban",
        href: "/dashboard/kanban",
        icon: Kanban,
      },
      { id: "focus", label: "Focus", href: "/dashboard/focus", icon: Focus },
      {
        id: "ai-assistant",
        label: "AI Assistant",
        href: "/dashboard/ai-assistant",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Progress",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        id: "insights",
        label: "Insights",
        href: "/dashboard/insights",
        icon: Sparkles,
      },
      { id: "habits", label: "Habits", href: "/dashboard/habits", icon: Flame },
      { id: "goals", label: "Goals", href: "/dashboard/goals", icon: Target },
    ],
  },
  {
    label: "Social",
    items: [
      {
        id: "leaderboard",
        label: "Leaderboard",
        href: "/dashboard/leaderboard",
        icon: Trophy,
      },
      {
        id: "friends",
        label: "Friends",
        href: "/dashboard/friends",
        icon: Users2,
      },
    ],
  },
];

export default function DashboardSidebar({ isCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Sidebar motion variants — animate width and apply overflow hidden to avoid layout jumps
  const sidebarVariants = {
    expanded: {
      width: 224, // slightly narrower (was 224)
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 22,
      },
    },
    collapsed: {
      width: 56, // slightly narrower when collapsed (was 64)
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 22,
      },
    },
  };

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <motion.aside
      className="h-full flex flex-col py-6 relative overflow-hidden"
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
    >
      {/* Logo / Brand */}
      <div className="px-4 mb-5">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <Link
              key="expanded"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="flex items-center gap-1"
              href="/"
            >
              <div className="h-9 w-9 flex-shrink-0">
                <Logo size={36} />
              </div>
              <span className="font-semibold text-lg text-black">Orbitly</span>
            </Link>
          ) : (
            <Link
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeInOut" }}
              className="flex justify-center"
              href="/"
            >
              <div className="h-9 w-9 flex-shrink-0 ml-3">
                <Logo size={36} />
              </div>
            </Link>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pr-2 scrollbar-none">
        {navigationGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={`${groupIndex > 0 ? "mt-6" : ""} space-y-1 ml-1`}
          >
            <AnimatePresence>
              {group.label && !isCollapsed && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.id} href={item.href}>
                  <motion.div
                    layout="position"
                    role="link"
                    tabIndex={0}
                    aria-current={active ? "page" : undefined}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(item.href);
                      }
                    }}
                    title={item.label}
                    className={`relative flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 group ${
                      active
                        ? "bg-black/90 text-white shadow-sm"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    } ${isCollapsed ? "justify-center rounded-full w-9 h-9 p-0 mb-2" : "rounded-full"}`}
                    // keyboard-visible focus styles
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      layout: { type: "spring", stiffness: 200, damping: 22 },
                      scale: { type: "spring", stiffness: 300, damping: 18 },
                    }}
                  >
                    <motion.div
                      layout="position"
                      className="flex items-center gap-3"
                      transition={{ layout: { type: "spring", stiffness: 200, damping: 22 } }}
                    >
                      <Icon
                        className="w-5 h-5 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <AnimatePresence mode="popLayout">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.16 }}
                            className="text-[13px] font-medium whitespace-nowrap overflow-hidden tracking-tight"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pt-6 mt-4 border-t border-gray-200 space-y-1">
        <Link href="/dashboard/settings">
          <motion.div
            layout="position"
            role="link"
            tabIndex={0}
            aria-current={isActive("/dashboard/settings") ? "page" : undefined}
            title="Settings"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/dashboard/settings");
              }
            }}
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 ${
              isActive("/dashboard/settings")
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            } ${isCollapsed ? "justify-center rounded-full w-11 h-11 p-0" : "rounded-full"}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              layout: {
                type: "spring",
                stiffness: 300,
                damping: 25,
              },
              scale: {
                type: "spring",
                stiffness: 400,
                damping: 20,
              },
            }}
          >
            <motion.div
              layout="position"
              className="flex items-center gap-3"
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                },
              }}
            >
              <Settings className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              <AnimatePresence mode="popLayout">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.16 }}
                    className="text-[13px] font-medium whitespace-nowrap overflow-hidden tracking-tight"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </Link>

        <motion.button
          layout="position"
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 ${
            isCollapsed
              ? "justify-center rounded-full w-11 h-11 p-0"
              : "w-full rounded-full"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{
            layout: {
              type: "spring",
              stiffness: 300,
              damping: 25,
            },
            scale: {
              type: "spring",
              stiffness: 400,
              damping: 20,
            },
          }}
        >
          <motion.div
            layout="position"
            className="flex items-center gap-3"
            transition={{
              layout: {
                type: "spring",
                stiffness: 300,
                damping: 25,
              },
            }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            <AnimatePresence mode="popLayout">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.16 }}
                  className="text-[13px] font-medium whitespace-nowrap overflow-hidden tracking-tight"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.button>
      </div>

      {/* User Profile */}
      <div className="px-3 pt-4">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="profile-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-gray-100 border border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-medium text-sm flex-shrink-0 overflow-hidden">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  session?.user?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-black truncate tracking-tight">
                  {session?.user?.name?.split(" ")[0] || "User"}
                </p>
                <p className="text-[11px] text-gray-500 truncate tracking-tight">
                  {session?.user?.email}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  session?.user?.name?.charAt(0) || "U"
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
