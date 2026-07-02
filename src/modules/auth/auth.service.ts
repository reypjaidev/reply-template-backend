import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config/index.ts";
import { UnauthorizedError, ValidationError } from "../../errors/index.ts";
import { usersRepository } from "../users/users.repository.ts";
import type { AuthResponse, LoginDto, RegisterDto } from "./auth.types.ts";

export const authService = {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // check email not already taken
    const exists = await usersRepository.emailExists(dto.email);
    if (exists) throw new ValidationError("Email already in use");

    // hash password — never store plain text
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const token = generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  },

  async login(dto: LoginDto): Promise<AuthResponse> {
    // find user by email — need password for comparison so no .select('-password')
    const user = await usersRepository.findByEmail(dto.email);

    // same error for wrong email or wrong password
    // never reveal which one was wrong
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const token = generateToken(user._id.toString());

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  },
};

// private helper — not exported
function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}
