import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import {
  verifyPassword,
  generateToken,
  generateUniqueUsername,
} from "@/lib/auth";

const authOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    // Credentials Provider (email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Check if user has a password (not OAuth-only user)
        if (!user.password_hash) {
          throw new Error("Please sign in with your OAuth provider");
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password_hash,
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Generate username if user doesn't have one
        if (!user.username) {
          user.username = await generateUniqueUsername(
            user.name || user.email?.split("@")[0],
          );
          await user.save();
          console.log(
            "Generated username for existing credentials user:",
            user.username,
          );
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.avatar_url || null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(
        "signIn callback - user:",
        user,
        "account:",
        account?.provider,
      );

      if (!account) {
        console.error("signIn callback - no account provided");
        return false;
      }

      if (account.provider === "google" || account.provider === "github") {
        try {
          await connectDB();

          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Generate unique username for new OAuth user
            const username = await generateUniqueUsername(
              user.name || user.email?.split("@")[0],
            );

            // Create new user from OAuth data
            existingUser = await User.create({
              name: user.name,
              email: user.email,
              username: username,
              avatar_url: user.image,
              // No password_hash for OAuth users
            });
            console.log(
              "Created new OAuth user:",
              existingUser._id,
              "with username:",
              username,
            );
          } else {
            // Generate username if existing user doesn't have one
            if (!existingUser.username) {
              existingUser.username = await generateUniqueUsername(
                user.name || user.email?.split("@")[0],
              );
              console.log(
                "Generated username for existing user:",
                existingUser.username,
              );
            }

            // Update user info if they sign in with OAuth
            existingUser.name = user.name;
            existingUser.avatar_url = user.image;
            await existingUser.save();
            console.log("Updated existing OAuth user:", existingUser._id);
          }

          user.id = existingUser._id.toString();
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      console.log(
        "jwt callback - token.id:",
        token.id,
        "user:",
        user?.id,
        "account:",
        account?.provider,
      );

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.picture = user.image;
        console.log("Setting token.id from user:", user.id);
      }

      if (account) {
        token.provider = account.provider;
      }

      // Always generate/regenerate custom JWT token for API authentication
      // This ensures existing sessions get the token too
      if (token.id && token.email) {
        token.apiToken = generateToken({
          userId: token.id,
          email: token.email,
        });
        console.log("Generated apiToken for userId:", token.id);
      } else {
        console.warn("Cannot generate apiToken - missing id or email:", {
          id: token.id,
          email: token.email,
        });
      }

      return token;
    },

    async session({ session, token }) {
      console.log(
        "session callback - token.id:",
        token?.id,
        "token.apiToken exists:",
        !!token?.apiToken,
      );

      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.username = token.username;
        session.user.image = token.picture;
        session.user.provider = token.provider;

        // Add custom JWT token to session for API calls
        session.user.token = token.apiToken;

        console.log("Session user after setting:", {
          id: session.user.id,
          email: session.user.email,
          hasToken: !!session.user.token,
        });
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export { authOptions };
