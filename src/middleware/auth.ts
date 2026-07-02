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
    // 1. check header exists
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    // 2. extract token
    const token = authHeader.split(" ")[1];

    // 3. verify token
    const payload = jwt.verify(token, config.jwt.secret) as { id: string };

    // 4. attach user to request — available in all downstream middleware
    const user = await usersRepository.findById(payload.id);
    if (!user) throw new UnauthorizedError("User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
