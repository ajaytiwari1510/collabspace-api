import { Router } from "express";
import { profileController } from "./profile.controller";
// We import 'authenticate' here because that is the name of the function in your middleware
import { authenticate } from "@/middleware/auth.middleware"; 

const router = Router();

// We add 'authenticate' as the second argument here to "hire the bouncer"
router.get("/me", authenticate, profileController.getMe.bind(profileController));

export default router;