import type { NextFunction, Response } from "express";
import type { TypedRequest } from "../../types/express.ts";
import { sendSuccess } from "../../utils/response.ts";
import { usersService } from "./users.service.ts";
import type { UpdateUserDto } from "./users.types.ts";

export const usersController = {
  // GET /api/users/me
  async getMe(
    req: TypedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await usersService.getById(req.user!._id.toString());
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/users/me
  async updateMe(
    req: TypedRequest<{}, UpdateUserDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await usersService.update(
        req.user!._id.toString(),
        req.body,
      );
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/users/me
  async deleteMe(
    req: TypedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await usersService.delete(req.user!._id.toString());
      sendSuccess(res, { message: "Account deleted" });
    } catch (err) {
      next(err);
    }
  },
};
