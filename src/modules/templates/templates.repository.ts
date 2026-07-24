// src/modules/templates/templates.repository.ts
import { TemplateModel } from "./templates.model.ts";
import type {
    CreateTemplateDto,
    UpdateTemplateDto,
} from "./templates.types.ts";

export const templatesRepository = {
    async findAllByUser(userID: string) {
        return TemplateModel.find({ userID }).sort({ createdAt: -1 }).lean();
    },

    async findByIdAndUser(id: string, userID: string) {
        return TemplateModel.findOne({ _id: id, userID }).lean();
    },

    async create(userID: string, dto: CreateTemplateDto) {
        return TemplateModel.create({ ...dto, userID });
    },

    async update(id: string, userID: string, dto: UpdateTemplateDto) {
        return TemplateModel.findOneAndUpdate(
            { _id: id, userID },
            { $set: dto },
            { new: true, runValidators: true },
        ).lean();
    },

    async delete(id: string, userID: string) {
        return TemplateModel.findOneAndDelete({ _id: id, userID }).lean();
    },
};
