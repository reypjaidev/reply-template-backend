import type { NextFunction, Response } from "express";
import type { TypedRequest } from "../../types/express.ts";
import { sendSuccess } from "../../utils/response.ts";
import { authService } from "./auth.service.ts";
import type { LoginDto, RegisterDto } from "./auth.types.ts";

export const authController = {
  // POST /api/auth/register
  async register(
    req: TypedRequest<{}, RegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  async login(
    req: TypedRequest<{}, LoginDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },
};
