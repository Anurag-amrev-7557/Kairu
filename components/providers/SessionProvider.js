"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * @typedef {Object} SessionProviderProps
 * @property {React.ReactNode} children - The child elements to be rendered within the provider.
 * @property {import('next-auth').Session | null} session - The NextAuth session object.
 */

/**
 * SessionProvider component that wraps the application to provide session context.
 * It uses `next-auth/react`'s `SessionProvider` internally.
 *
 * @param {SessionProviderProps} props - The properties for the SessionProvider component.
 * @returns {JSX.Element} The NextAuthSessionProvider component with children.
 */
export function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}

SessionProvider.displayName = "SessionProvider";
