// src/modules/templates/templates.model.ts
import mongoose, { type Document, Schema } from "mongoose";

export interface TemplateDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userID: mongoose.Types.ObjectId;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const templateSchema = new Schema<TemplateDocument>(
    {
        userID: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            minlength: [2, "Title must be at least 2 characters"],
            maxlength: [50, "Title cannot exceed 50 characters"],
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            trim: true,
            minlength: [2, "Content must be at least 2 characters"],
            maxlength: [1000, "Content cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true, // auto-manages createdAt and updatedAt
    },
);

templateSchema.index({ userID: 1 });

export const TemplateModel = mongoose.model<TemplateDocument>(
    "Template",
    templateSchema,
);
