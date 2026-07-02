import { Router } from "express";
import { validate } from "../../middleware/validate.ts";
import { usersController } from "./users.controller.ts";
import { updateUserSchema } from "./users.schema.ts";

const router = Router();

// all routes here are already protected by authMiddleware in app.ts
router.get("/", usersController.getMe);
router.put("/", validate(updateUserSchema), usersController.updateMe);
router.delete("/", usersController.deleteMe);

export default router;
