import { prisma } from "../../config/database";

export class ProfileRepository {
  async findProfileByUserId(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
      },
    });
  }

  async updateProfileByUserId(userId: string, data: {
    displayName?: string;
    headline?: string;
    bio?: string;
    college?: string;
    degree?: string;
    yearOfStudy?: number;
    githubUrl?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    availability?: string;
    skills?: string[];
    profileComplete?: boolean;
  }) {
    return await prisma.profile.update({
      where: { userId },
      data,
    });
  }
}

export const profileRepository = new ProfileRepository();
