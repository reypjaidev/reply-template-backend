// src/types/express.ts
import type { Request } from "express";
import type { UserDocument } from "../modules/users/users.model.ts";

export interface TypedRequest<
  Params = {},
  ReqBody = {},
  Query = {},
> extends Request<Params, any, ReqBody, Query> {
  user?: UserDocument; // set by authMiddleware; only guaranteed on protected routes
}
