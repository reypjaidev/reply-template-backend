import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index.ts";
import { UnauthorizedError } from "../errors/index.ts";
import { usersRepository } from "../modules/users/users.repository.ts";
import type { TypedRequest } from "../types/express.ts";

export async function authMiddleware(
  req: TypedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 1. read token from the httpOnly cookie set at login/register
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    // 2. verify token
    const payload = jwt.verify(token, config.jwt.secret) as { id: string };

    // 3. attach user to request — available in all downstream middleware
    const user = await usersRepository.findById(payload.id);
    if (!user) throw new UnauthorizedError("User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
