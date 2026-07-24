import { NotFoundError } from "../../errors/index.ts";
import { templatesRepository } from "./templates.repository.ts";
import type {
    CreateTemplateDto,
    TemplateResponseDto,
    UpdateTemplateDto,
} from "./templates.types.ts";
import type { TemplateDocument } from "./templates.model.ts";

function toResponseDto(
    template: Pick<
        TemplateDocument,
        "_id" | "title" | "content" | "createdAt" | "updatedAt"
    >,
): TemplateResponseDto {
    return {
        id: template._id.toString(),
        title: template.title,
        content: template.content,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
    };
}

export const templatesService = {
    async getAll(userID: string): Promise<TemplateResponseDto[]> {
        const templates = await templatesRepository.findAllByUser(userID);
        return templates.map(toResponseDto);
    },

    async getById(id: string, userID: string): Promise<TemplateResponseDto> {
        const template = await templatesRepository.findByIdAndUser(id, userID);
        if (!template) throw new NotFoundError("Template not found");

        return toResponseDto(template);
    },

    async create(
        userID: string,
        dto: CreateTemplateDto,
    ): Promise<TemplateResponseDto> {
        const template = await templatesRepository.create(userID, dto);
        return toResponseDto(template);
    },

    async update(
        id: string,
        userID: string,
        dto: UpdateTemplateDto,
    ): Promise<TemplateResponseDto> {
        const template = await templatesRepository.update(id, userID, dto);
        if (!template) throw new NotFoundError("Template not found");

        return toResponseDto(template);
    },

    async delete(id: string, userID: string): Promise<void> {
        const template = await templatesRepository.delete(id, userID);
        if (!template) throw new NotFoundError("Template not found");
    },
};
