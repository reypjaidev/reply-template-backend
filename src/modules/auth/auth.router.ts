import { Router } from "express";
import { validate } from "../../middleware/validate.ts";
import { authController } from "./auth.controller.ts";
import { loginSchema, registerSchema } from "./auth.schema.ts";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;
