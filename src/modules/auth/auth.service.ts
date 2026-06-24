import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { authRepository } from "./auth.repository";

// Decode base64 PEM keys stored in env vars
const privateKey = Buffer.from(env.JWT_PRIVATE_KEY_BASE64, "base64").toString("utf-8");
const publicKey = Buffer.from(env.JWT_PUBLIC_KEY_BASE64, "base64").toString("utf-8");

function signAccessToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { sub: userId, email, role },
    { key: privateKey, passphrase: "" },
    {
      algorithm: "RS256",
      expiresIn: "15m",
    },
  );
}

function signRefreshToken(): string {
  return randomUUID() + randomUUID();
}

export const authService = {
  async register(name: string, email: string, password: string) {
    // Check if email already exists
    const existing = await authRepository.findUserByEmail(email);
    if (existing) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists.");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + profile in one transaction
    const user = await authRepository.createUser({ name, email, passwordHash });

    // Issue tokens
    const accessToken = signAccessToken(user.id, user.email, user.role);
    const rawRefreshToken = signRefreshToken();
    const tokenHash = await bcrypt.hash(rawRefreshToken, 10);
    const familyId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_TOKEN_TTL_DAYS);

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: false,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  async login(email: string, password: string) {
    // Find user
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    // Check if banned
    if (user.isBanned) {
      throw new AppError(403, "ACCOUNT_BANNED", "Account suspended. Contact support.");
    }

    // Check if locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(403, "ACCOUNT_LOCKED", "Account locked. Try again in 15 minutes.");
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash ?? "");
    if (!valid) {
      // Increment fail count, lock after 5 attempts
      const lockUntil =
        user.loginFailCount + 1 >= 5
          ? new Date(Date.now() + 15 * 60 * 1000)
          : undefined;
      await authRepository.incrementLoginFail(user.id, lockUntil);
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    // Reset fail count
    await authRepository.resetLoginFail(user.id);

    // Issue tokens
    const accessToken = signAccessToken(user.id, user.email, user.role);
    const rawRefreshToken = signRefreshToken();
    const tokenHash = await bcrypt.hash(rawRefreshToken, 10);
    const familyId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_TOKEN_TTL_DAYS);

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: false,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  },

  async refresh(rawToken: string) {
    // Find matching token
    const tokenHash = await bcrypt.hash(rawToken, 10);

    // We need to find by comparing — scan recent tokens for this user
    // In production use a faster lookup; for MVP this is acceptable
    const stored = await authRepository.findRefreshToken(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new AppError(401, "REFRESH_TOKEN_INVALID", "Session expired. Please log in again.");
    }

    // Rotate token
    await authRepository.revokeRefreshToken(stored.tokenHash);

    const accessToken = signAccessToken(stored.user.id, stored.user.email, stored.user.role);
    const newRawToken = signRefreshToken();
    const newHash = await bcrypt.hash(newRawToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_TOKEN_TTL_DAYS);

    await authRepository.createRefreshToken({
      userId: stored.user.id,
      tokenHash: newHash,
      familyId: stored.familyId,
      expiresAt,
    });

    return { accessToken, refreshToken: newRawToken };
  },

  async logout(userId: string) {
    await authRepository.revokeAllUserTokens(userId);
  },

  verifyAccessToken(token: string) {
    try {
      const payload = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
      return payload as { sub: string; email: string; role: string };
    } catch {
      throw new AppError(401, "UNAUTHENTICATED", "Invalid or expired token.");
    }
  },
};