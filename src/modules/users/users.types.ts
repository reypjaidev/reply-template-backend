// src/modules/users/users.types.ts
export interface CreateUserDto {
  name: string;
  email: string;
  password: string; // will be hashed in auth.service before hitting repository
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
