import { TemplateDocument } from "./templates.model.ts";

export interface CreateTemplateDto {
    title: string;
    body: string;
    color: TemplateDocument["color"];
}

export interface UpdateTemplateDto {
    title?: string;
    body?: string;
    color?: TemplateDocument["color"];
}

export interface TemplateResponseDto {
    id: string;
    title: string;
    body: string;
    color: TemplateDocument["color"];
    createdAt: Date;
    updatedAt: Date;
}
