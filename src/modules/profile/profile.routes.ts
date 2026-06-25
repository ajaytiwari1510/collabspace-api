import { Router } from "express";
import { profileController } from "./profile.controller";
import { authenticate } from "@/middleware/auth.middleware";

const router = Router();

router.get("/me", authenticate, profileController.getMe.bind(profileController));
router.patch("/me", authenticate, profileController.updateMe.bind(profileController));

export default router;
