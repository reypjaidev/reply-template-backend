import type { NextFunction, Response } from "express";
import type { TypedRequest } from "../../types/express.ts";
import { sendSuccess } from "../../utils/response.ts";
import { templatesService } from "./templates.service.ts";
import type {
    CreateTemplateDto,
    UpdateTemplateDto,
} from "./templates.types.ts";

export const templatesController = {
    // GET /api/templates
    async getTemplates(
        req: TypedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const templates = await templatesService.getAll(
                req.user!._id.toString(),
            );
            sendSuccess(res, templates);
        } catch (err) {
            next(err);
        }
    },

    // GET /api/templates/:id
    async getTemplate(
        req: TypedRequest<{ id: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const template = await templatesService.getById(
                req.params.id,
                req.user!._id.toString(),
            );
            sendSuccess(res, template);
        } catch (err) {
            next(err);
        }
    },

    // POST /api/templates
    async createTemplate(
        req: TypedRequest<{}, CreateTemplateDto>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const template = await templatesService.create(
                req.user!._id.toString(),
                req.body,
            );
            sendSuccess(res, template, 201);
        } catch (err) {
            next(err);
        }
    },

    // PUT /api/templates/:id
    async updateTemplate(
        req: TypedRequest<{ id: string }, UpdateTemplateDto>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const template = await templatesService.update(
                req.params.id,
                req.user!._id.toString(),
                req.body,
            );
            sendSuccess(res, template);
        } catch (err) {
            next(err);
        }
    },

    // DELETE /api/templates/:id
    async deleteTemplate(
        req: TypedRequest<{ id: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await templatesService.delete(
                req.params.id,
                req.user!._id.toString(),
            );
            sendSuccess(res, { message: "Template deleted" });
        } catch (err) {
            next(err);
        }
    },
};
