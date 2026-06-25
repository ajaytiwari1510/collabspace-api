import { profileRepository } from "./profile.repository";

export class ProfileService {
  async getMyProfile(userId: string) {
    const userProfile = await profileRepository.findProfileByUserId(userId);
    if (!userProfile) {
      throw new Error("User profile not found.");
    }
    return userProfile;
  }

  async updateMyProfile(userId: string, data: {
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
    return await profileRepository.updateProfileByUserId(userId, data);
  }
}

export const profileService = new ProfileService();
