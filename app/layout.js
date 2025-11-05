import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased transition-colors duration-300" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
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
