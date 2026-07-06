import type { NextFunction, Response } from "express";
import config from "../../config/index.ts";
import { UnauthorizedError } from "../../errors/index.ts";
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

  // POST /api/auth/refresh
  async refresh(
    req: TypedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const rawToken = req.cookies?.refreshToken;
      if (!rawToken) throw new UnauthorizedError("No refresh token provided");

      const { accessToken, refreshToken } = await authService.refresh(
        rawToken,
      );
      setAuthCookies(res, accessToken, refreshToken);
      sendSuccess(res, { message: "Token refreshed" });
    } catch (err) {
      next(err);
    }
  },
};
