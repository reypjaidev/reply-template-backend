export interface CreateTemplateDto {
    title: string;
    content: string;
}

export interface UpdateTemplateDto {
    title?: string;
    content?: string;
}

export interface TemplateResponseDto {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
