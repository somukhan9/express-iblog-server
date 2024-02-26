import { Request, Response } from "express"
import httpStatus from "http-status"
import { createApiError } from "../utils/ApiError"

export const notFound = (req: Request, res: Response) => {
  res
    .status(httpStatus.NOT_FOUND)
    .json(createApiError("Resource not found", httpStatus.NOT_FOUND, null, []))
}
