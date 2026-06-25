import { profileRepository } from "./profile.repository";

export class ProfileService {
  /**
   * Validates the request and retrieves the profile
   */
  async getMyProfile(userId: string) {
    const userProfile = await profileRepository.findProfileByUserId(userId);
    
    // Business logic: If for some reason the user doesn't exist in the DB, throw an error
    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    return userProfile;
  }
}

export const profileService = new ProfileService();