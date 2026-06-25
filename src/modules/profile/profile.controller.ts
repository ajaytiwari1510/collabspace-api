import { Request, Response, NextFunction } from "express";
import { profileService } from "./profile.service";

export class ProfileController {
  /**
   * Handles the GET /api/v1/profile/me request
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract the user ID attached to the request by your JWT Auth Middleware
      const userId = (req as any).user.id;

      // 2. Pass it to the service layer
      const profileData = await profileService.getMyProfile(userId);

      // 3. Send the successful JSON response
      res.status(200).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      // Pass any errors to your global Express error handler
      next(error);
    }
  }
}

export const profileController = new ProfileController();