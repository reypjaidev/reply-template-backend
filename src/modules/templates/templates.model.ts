// src/modules/templates/templates.model.ts
import mongoose, { type Document, Schema } from "mongoose";

export interface TemplateDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userID: mongoose.Types.ObjectId;
    title: string;
    body: string;
    color: "yellow" | "pink" | "blue" | "green" | "purple" | "gray";
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
        body: {
            type: String,
            required: [true, "Content is required"],
            trim: true,
            minlength: [2, "Content must be at least 2 characters"],
            maxlength: [1000, "Content cannot exceed 1000 characters"],
        },
        color: {
            type: String,
            enum: ["yellow", "pink", "blue", "green", "purple", "gray"],
            default: "gray",
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
