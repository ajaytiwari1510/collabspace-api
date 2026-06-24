import { prisma } from "@/config/database";

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        profile: {
          create: {
            displayName: data.name,
          },
        },
      },
    });
  },

  async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  },

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  },

  async revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async incrementLoginFail(userId: string, lockUntil?: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        loginFailCount: { increment: 1 },
        lockedUntil: lockUntil,
      },
    });
  },

  async resetLoginFail(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        loginFailCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  },
};