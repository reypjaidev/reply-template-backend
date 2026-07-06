import type { NextFunction, Response } from "express";
import config from "../../config/index.ts";
import type { TypedRequest } from "../../types/express.ts";
import { sendSuccess } from "../../utils/response.ts";
import { authService } from "./auth.service.ts";
import type { LoginDto, RegisterDto } from "./auth.types.ts";

// private helper — not exported
function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: "lax",
    maxAge: config.jwt.accessTokenMaxAge,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: "lax",
    maxAge: config.jwt.refreshTokenExpiresIn,
  });
}

export const authController = {
  // POST /api/auth/register
  async register(
    req: TypedRequest<{}, RegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { accessToken, refreshToken, user } = await authService.register(
        req.body,
      );
      setAuthCookies(res, accessToken, refreshToken);
      sendSuccess(res, { user });
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
      const { accessToken, refreshToken, user } = await authService.login(
        req.body,
      );
      setAuthCookies(res, accessToken, refreshToken);
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },
};
