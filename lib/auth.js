import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Authentication utilities for Orbitly application
 * @module lib/auth
 */

// Configuration constants
const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 12;
const MAX_USERNAME_ATTEMPTS = 10;

/**
 * Error classes for authentication
 */
class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

/**
 * Hash a password using bcrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hashed password
 */
export async function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new AuthError("Invalid password provided", "INVALID_PASSWORD");
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param {string} password - The password to verify
 * @param {string} hashedPassword - The hash to verify against
 * @returns {Promise<boolean>} True if the password matches the hash
 */
export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    throw new AuthError(
      "Password and hash are required",
      "MISSING_CREDENTIALS",
    );
  }
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 * @param {Object} payload - The payload to encode in the token
 * @param {string} [expiresIn=DEFAULT_JWT_EXPIRES_IN] - Token expiration time
 * @returns {string} The generated JWT token
 * @throws {AuthError} If JWT secret is not configured
 */
export function generateToken(payload, expiresIn = DEFAULT_JWT_EXPIRES_IN) {
  if (!JWT_SECRET) {
    throw new AuthError(
      "JWT secret not configured",
      "JWT_SECRET_NOT_CONFIGURED",
    );
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object|null} The decoded payload or null if invalid
 */
export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
}

/**
 * Extract token from request headers
 * @param {Object} req - The request object (Next.js or Express compatible)
 * @returns {string|null} The extracted token or null if not found
 */
export function getTokenFromHeader(req) {
  if (!req?.headers) return null;

  // Handle Next.js App Router Headers object
  const authHeader = req.headers.get
    ? req.headers.get("authorization") || req.headers.get("Authorization")
    : req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Authenticate a request
 * @param {Object} req - The request object
 * @returns {Promise<Object>} Authentication result with user data if successful
 */
export async function authenticate(req) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return {
        authenticated: false,
        error: new AuthError("No token provided", "NO_TOKEN"),
      };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        authenticated: false,
        error: new AuthError("Invalid token", "INVALID_TOKEN"),
      };
    }

    return {
      authenticated: true,
      userId: decoded.userId,
      user: decoded,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      authenticated: false,
      error:
        error instanceof AuthError
          ? error
          : new AuthError("Authentication failed", "AUTH_FAILED"),
    };
  }
}

/**
 * Generate a random token for email verification, etc.
 * @param {number} [byteLength=32] - Length of random bytes to generate
 * @returns {string} Hex-encoded random token
 */
export function generateRandomToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Generate a unique username
 * @param {string} [baseName=null] - Optional base name to use
 * @returns {Promise<string>} A unique username
 */
export async function generateUniqueUsername(baseName = null) {
  const User = (await import("@/lib/models/User")).default;

  // If baseName provided, try to use it
  if (baseName) {
    const cleanBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 15);

    // Try base name with random numbers
    for (let i = 0; i < MAX_USERNAME_ATTEMPTS; i++) {
      const suffix = i === 0 ? "" : Math.floor(Math.random() * 9999);
      const username = `${cleanBase}${suffix}`;
      if (!(await User.findOne({ username }))) {
        return username;
      }
    }
  }

  // Fallback to random username generation
  const adjectives = [
    "swift",
    "bright",
    "cosmic",
    "stellar",
    "quantum",
    "noble",
    "rapid",
    "clever",
    "mighty",
    "vibrant",
    "serene",
    "dynamic",
    "epic",
    "lunar",
    "solar",
    "mystic",
    "wise",
    "bold",
    "brave",
    "cool",
    "neat",
  ];

  const nouns = [
    "eagle",
    "falcon",
    "phoenix",
    "dragon",
    "tiger",
    "wolf",
    "lion",
    "panda",
    "koala",
    "fox",
    "hawk",
    "bear",
    "otter",
    "lynx",
    "raven",
    "spark",
    "star",
    "comet",
    "nebula",
    "orbit",
    "planet",
    "galaxy",
  ];

  // Try random combinations
  for (let i = 0; i < MAX_USERNAME_ATTEMPTS; i++) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999);
    const username = `${adjective}_${noun}${randomNum}`;

    if (!(await User.findOne({ username }))) {
      return username;
    }
  }

  // Final fallback with timestamp
  return `user_${Date.now()}`;
}
