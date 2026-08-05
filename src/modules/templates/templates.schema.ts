import { z } from "zod";

export const createTemplateSchema = z.object({
    title: z
        .string()
        .min(2, "Title must be at least 2 characters")
        .max(50, "Title cannot exceed 50 characters"),
    body: z
        .string()
        .min(2, "Content must be at least 2 characters")
        .max(1000, "Content cannot exceed 1000 characters"),
});

export const updateTemplateSchema = z
    .object({
        title: z
            .string()
            .min(2, "Title must be at least 2 characters")
            .max(50, "Title cannot exceed 50 characters")
            .optional(),
        body: z
            .string()
            .min(2, "Content must be at least 2 characters")
            .max(1000, "Content cannot exceed 1000 characters")
            .optional(),
    })
    .refine((data) => data.title !== undefined || data.body !== undefined, {
        message: "At least one field must be provided",
    });
