export interface CreateTemplateDto {
    title: string;
    body: string;
}

export interface UpdateTemplateDto {
    title?: string;
    body?: string;
}

export interface TemplateResponseDto {
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}
