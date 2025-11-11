// ThemeProvider removed — theme management is disabled across the site.
// Provide a small stub so any accidental imports remain safe.
export function useTheme() {
  return { theme: "light", toggleTheme: () => {} };
}

export function ThemeProvider({ children }) {
  return children;
}
