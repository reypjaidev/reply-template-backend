// src/utils/response.ts
import type { Response } from "express";
import type { ApiResponse } from "../types/response.ts";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
): void => {
  const response: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: ApiResponse<T[]>["meta"],
): void => {
  const response: ApiResponse<T[]> = { success: true, data, meta };
  res.json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
): void => {
  const response: ApiResponse<null> = { success: false, error };
  res.status(statusCode).json(response);
};
