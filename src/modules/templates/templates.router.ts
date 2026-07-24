import { Router } from "express";
import { validate } from "../../middleware/validate.ts";
import { templatesController } from "./templates.controller.ts";
import {
    createTemplateSchema,
    updateTemplateSchema,
} from "./templates.schema.ts";

const router = Router();

// all routes here are already protected by authMiddleware in app.ts
router.get("/", templatesController.getTemplates);
router.get("/:id", templatesController.getTemplate);
router.post(
    "/",
    validate(createTemplateSchema),
    templatesController.createTemplate,
);
router.put(
    "/:id",
    validate(updateTemplateSchema),
    templatesController.updateTemplate,
);
router.delete("/:id", templatesController.deleteTemplate);

export default router;
