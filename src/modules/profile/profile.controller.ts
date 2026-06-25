import { Request, Response, NextFunction } from "express";
import { profileService } from "./profile.service";

export class ProfileController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const profileData = await profileService.getMyProfile(userId);
      res.status(200).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const updatedProfile = await profileService.updateMyProfile(userId, req.body);
      res.status(200).json({
        success: true,
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
