// src/modules/users/users.repository.ts
import { UserModel } from "./users.model.ts";
import type { CreateUserDto, UpdateUserDto } from "./users.types.ts";

export const usersRepository = {
  async findById(id: string) {
    return UserModel.findById(id)
      .select("-password") // never return password
      .lean();
  },

  async findByEmail(email: string) {
    return UserModel.findOne({ email }).lean();
    // no .select('-password') here
    // auth service needs it for bcrypt comparison
  },

  async create(dto: CreateUserDto) {
    return UserModel.create(dto);
  },

  async update(id: string, dto: UpdateUserDto) {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    )
      .select("-password")
      .lean();
  },

  async delete(id: string) {
    return UserModel.findByIdAndDelete(id).lean();
  },

  async emailExists(email: string): Promise<boolean> {
    const user = await UserModel.findOne({ email }).select("_id").lean();
    return !!user;
  },
};
