import "./globals.css";
import Script from "next/script";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata = {
  title: "Orbitly - Master Your Focus & Productivity",
  description:
    "Session management and day planner to help you focus, understand work patterns, and build better habits.",
  icons: {
    icon: [{ url: "/icons/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/icons/favicon.svg"],
    apple: ["/icons/favicon.svg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased transition-colors duration-300" suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Script
          src="/scripts/html2canvas.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/scripts/liquidGL.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
