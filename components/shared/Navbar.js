"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowUpRight,
  Menu as MenuIcon,
  X as CloseIcon,
  User as UserIcon,
  LogOut,
  Settings,
  LayoutDashboard,
  ListTodo,
  Focus,
  BarChart3,
  Target,
  Flame,
} from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
  MotionConfig,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../providers/ThemeProvider";

// Performance constants
const ANIMATION_DURATION = 0.15;
const SCROLL_CONFIG = {
  stiffness: 150,
  damping: 24,
  mass: 0.28,
  restDelta: 0.001,
};
const SCROLL_THRESHOLD = 100;

// Animation configs - defined once
const AUTH_BUTTON_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  mass: 0.45,
  opacity: { duration: 0.18 },
};

const MOBILE_MENU_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 0.5,
};

// Main navigation items configuration - Public pages
const publicNavigationItems = Object.freeze([
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]);

// Dashboard navigation items - for authenticated users
const dashboardNavigationItems = Object.freeze([
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/focus", label: "Focus", icon: Focus },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/habits", label: "Habits", icon: Flame },
]);

// Highly optimized NavLink component
const NavLink = memo(({ href, children, pathname }) => {
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));
  const { theme } = useTheme();

  // explicit colors so background behaves correctly in both themes
  const activeColor = theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const inactiveColor = theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="group text-black dark:text-white relative hover:opacity-80 transition-all duration-300 rounded-md px-1 py-1"
    >
      {children}
      <span
        className={`pointer-events-none absolute left-0 right-0 -bottom-0.5 h-[2px] origin-left rounded-full transition-all duration-300 ease-out ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
        style={{ backgroundColor: active ? activeColor : inactiveColor }}
      />
    </Link>
  );
});
NavLink.displayName = "NavLink";

// User Profile Dropdown Component
const UserProfileDropdown = memo(({ user, onSignOut }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <motion.button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-black dark:bg-white hover:opacity-80 transition-all duration-300"
        aria-label="User menu"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <UserIcon size={18} strokeWidth={1.5} className="flex-shrink-0 text-white dark:text-black" />
        )}
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className={
              theme === "dark"
                ? "absolute right-0 top-full mt-6 w-56 rounded-xl bg-gray-800 text-white border border-gray-700 shadow-2xl overflow-hidden z-50"
                : "absolute right-0 top-full mt-6 w-56 rounded-xl bg-white text-black border border-gray-200 shadow-lg overflow-hidden z-50"
            }
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-black dark:text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-black dark:text-white hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-black/10 transition-all duration-300"
              >
                <Settings size={16} />
                Settings
              </Link>
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-200 dark:border-gray-700 py-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onSignOut();
                }}
                className="flex items-center !rounded-none gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-red-50 transition-all duration-300"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
UserProfileDropdown.displayName = "UserProfileDropdown";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme } = useTheme();

  // State management
  const [mobileOpen, setMobileOpen] = useState(false);

  // Optimized scroll animations
  const { scrollY } = useScroll();
  const scrollProgress = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]);
  const progress = useSpring(scrollProgress, SCROLL_CONFIG);

  // Animation values
  const radius = useTransform(progress, [0, 1], [20, 999]);
  const pad = useTransform(progress, [0, 1], [24, 12]);

  // Theme-aware colors - memoized based on theme
  const bgColors = useMemo(
    () => theme === "dark"
      ? ["rgba(31,41,55,0.0)", "rgba(31,41,55,1)"]
      : ["rgba(255,255,255,0.0)", "rgba(255,255,255,0.70)"],
    [theme]
  );

  const shadowColors = useMemo(
    () => theme === "dark"
      ? ["0 0 0 rgba(0,0,0,0)", "0 10px 30px rgba(0,0,0,0.35)"]
      : ["0 0 0 rgba(0,0,0,0)", "0 10px 30px rgba(0,0,0,0.12)"],
    [theme]
  );

  const bg = useTransform(progress, [0, 1], bgColors);
  const shadow = useTransform(progress, [0, 1], shadowColors);
  const ringOpacity = useTransform(progress, [0, 1], [0, 1]);

  // Optimized event handlers
  const handleMobileMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    handleMobileMenuClose();
    await signOut({ redirect: false });
    router.push("/");
  }, [router, handleMobileMenuClose]);

  // Combined effect for menu interactions - improved with early return
  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    // Body scroll lock for mobile menu
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  // Determine which navigation items to show based on auth status
  const navigationItems = useMemo(
    () => status === "authenticated" ? dashboardNavigationItems : publicNavigationItems,
    [status]
  );

  // Check if user is authenticated once
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Memoized navigation links
  const desktopNavLinks = useMemo(
    () =>
      navigationItems.map((item) => (
        <NavLink key={item.href} href={item.href} pathname={pathname}>
          {item.label}
        </NavLink>
      )),
    [pathname, navigationItems],
  );

  const mobileNavLinks = useMemo(
    () =>
      navigationItems.map((item) => (
        <Link
          key={item.href}
          onClick={handleMobileMenuClose}
          href={item.href}
          className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center gap-2 transition-all duration-300 text-black dark:text-white"
        >
          {item.icon && <item.icon size={16} className="flex-shrink-0" />}
          {item.label}
        </Link>
      )),
    [navigationItems, handleMobileMenuClose],
  );

  // Accessibility improvements
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Tab" && mobileOpen) {
        const focusableElements = document.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    },
    [mobileOpen],
  );

  useEffect(() => {
    if (mobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [mobileOpen, handleKeyDown]);

  return (
    <MotionConfig transition={{ duration: ANIMATION_DURATION }}>
      <header className="sticky top-4 z-40 w-full">
        <motion.div
          style={{
            borderRadius: radius,
            boxShadow: shadow,
            backgroundColor: bg,
            paddingLeft: pad,
            paddingRight: pad,
            willChange: "border-radius, box-shadow, background-color, padding",
            transform: "translateZ(0)",
          }}
          className="mx-auto max-w-7xl h-14 flex items-center rounded-full justify-between backdrop-blur-md"
          suppressHydrationWarning
        >
          <motion.div
            aria-hidden
            style={{ opacity: ringOpacity }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-black/5 dark:ring-white/10"
          />

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 hover:opacity-90 transition-all duration-300 rounded-md"
              aria-label="Home"
            >
              <div className="h-9 w-9 flex-shrink-0">
                <Logo size={36} />
              </div>
              <span className="font-semibold tracking-tight text-[19.2px] text-black dark:text-white transition-colors duration-300">
                Orbitly
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-8 text-[15px]"
            role="navigation"
            aria-label="Main navigation"
          >
            {desktopNavLinks}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={handleMobileMenuToggle}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-black dark:text-white"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <MenuIcon size={18} strokeWidth={1.5} />
          </button>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            {!isLoading && (
              isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={AUTH_BUTTON_TRANSITION}
                >
                  <UserProfileDropdown
                    user={session?.user}
                    onSignOut={handleSignOut}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={AUTH_BUTTON_TRANSITION}
                  className="flex items-center gap-3"
                >
                  <Link
                    href="/login"
                    className="text-sm text-black dark:text-white transition-all duration-300 hover:opacity-80 rounded-md px-2 py-1"
                    aria-label="Log in"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm hover:opacity-90 transition-all duration-300"
                    aria-label="Sign up"
                  >
                    Sign up <ArrowUpRight size={16} strokeWidth={1.5} />
                  </Link>
                </motion.div>
              )
            )}
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <motion.div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleMobileMenuClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={MOBILE_MENU_TRANSITION}
                className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-l border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-300"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="font-semibold text-black dark:text-white">Menu</div>
                  <button
                    onClick={handleMobileMenuClose}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-black dark:text-white"
                    aria-label="Close menu"
                  >
                    <CloseIcon size={18} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                {/* Theme Toggle in Mobile Menu */}
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-black dark:text-white">Theme</span>
                  <ThemeToggle />
                </div>

                <div className="p-2 flex flex-col text-sm gap-1">
                  {mobileNavLinks}
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                {/* Mobile auth section */}
                {isAuthenticated ? (
                  <div className="p-2 space-y-2">
                    {/* User Info */}
                    <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-black dark:text-white truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <Link
                      onClick={handleMobileMenuClose}
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-black dark:text-white"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    <Link
                      onClick={handleMobileMenuClose}
                      href="/login"
                      className="block px-3 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-black dark:text-white"
                      aria-label="Log in"
                    >
                      Log in
                    </Link>
                    <Link
                      onClick={handleMobileMenuClose}
                      href="/register"
                      className="inline-flex items-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm hover:opacity-90 transition-all duration-300 w-full justify-center"
                      aria-label="Sign up"
                    >
                      Sign up <ArrowUpRight size={16} strokeWidth={1.5} />
                    </Link>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}

export default memo(Navbar);
