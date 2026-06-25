import { prisma } from "../../config/database";

export class ProfileRepository {
  /**
   * Fetches a user and their associated profile by the User ID.
   */
  async findProfileByUserId(userId: string) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        // This tells Prisma to JOIN the profile table and return that data too
        profile: true, 
      },
    });
  }
}

export const profileRepository = new ProfileRepository();