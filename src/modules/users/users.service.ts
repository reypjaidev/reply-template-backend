import { NotFoundError, ValidationError } from "../../errors/index.ts";
import { usersRepository } from "./users.repository.ts";
import type { UpdateUserDto, UserResponseDto } from "./users.types.ts";

export const usersService = {
  async getById(id: string): Promise<UserResponseDto> {
    const user = await usersRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    // if updating email, check it's not already taken
    if (dto.email) {
      const exists = await usersRepository.emailExists(dto.email);
      if (exists) throw new ValidationError("Email already in use");
    }

    const user = await usersRepository.update(id, dto);
    if (!user) throw new NotFoundError("User not found");

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async delete(id: string): Promise<void> {
    const user = await usersRepository.delete(id);
    if (!user) throw new NotFoundError("User not found");
  },
};
