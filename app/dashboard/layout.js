"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Script from "next/script";
import ResizableSidebar from "@/components/dashboard/ResizableSidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Toaster } from "sonner";
import QuickTaskProvider from "@/components/dashboard/QuickTaskProvider";

/**
 * DashboardLayout Component
 *
 * This is the main layout component for the dashboard area of the application.
 * It handles authentication checks, loads necessary scripts, and provides the
 * overall structure for the dashboard including sidebar and main content area.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to be rendered in the main area
 * @returns {JSX.Element} The dashboard layout
 */
export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  /**
   * Effect hook to handle authentication state changes
   * Redirects to login page if user is not authenticated
   */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  /**
   * Loading State
   * Shows a loading spinner while the session is being loaded
   */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  /**
   * Error State
   * Shows an error message if there's an issue with authentication
   */
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-red-500">
          Authentication error. Please refresh the page or contact support.
        </div>
      </div>
    );
  }

  /**
   * Unauthenticated State
   * Returns null while redirecting to login page
   */
  if (!session) {
    return null;
  }

  return (
    <>
      {/* Meta tags for better SEO and viewport settings */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* External Scripts Section */}
      <section className="scripts">
        {/* html2canvas library for canvas rendering */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          strategy="beforeInteractive"
          onError={(e) => {
            console.error("Failed to load html2canvas:", e);
          }}
        />

        {/* Custom liquidGL library for 3D visualizations */}
        <Script
          src="/scripts/liquidGL.js"
          strategy="afterInteractive"
          onError={(e) => {
            console.error("Failed to load liquidGL:", e);
          }}
        />
      </section>

      {/* Main Application Container */}
      <QuickTaskProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Section */}
          <ResizableSidebar>
            {(isCollapsed) => (
              <DashboardSidebar isCollapsed={isCollapsed} user={session.user} />
            )}
          </ResizableSidebar>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">{children}</main>

          {/* Notification System */}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              className: "toast-notification",
              duration: 5000,
            }}
          />
        </div>
      </QuickTaskProvider>
    </>
  );
}
