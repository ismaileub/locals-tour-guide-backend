/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";

interface TMeta {
  total: number;
}

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
}

// Use the full generic Response type
export const sendResponse = <T>(
  res: Response<any, Record<string, any>>,
  data: TResponse<T>
) => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};
