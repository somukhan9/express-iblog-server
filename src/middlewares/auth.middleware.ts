import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import httpStatus from "http-status"

import { asyncWrapper } from "../utils/async-wrapper"
import { createApiError } from "../utils/ApiError"
import { User } from "../models/user.model"

export const verifyAccessToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken) {
      return next(
        createApiError(
          "Unauthorized request",
          httpStatus.UNAUTHORIZED,
          null,
          [],
        ),
      )
    }

    // @ts-ignore
    const { userId } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)

    const user = await User.findById(userId)

    if (!user) {
      return next(
        createApiError(
          "Invalid access token",
          httpStatus.UNAUTHORIZED,
          null,
          [],
        ),
      )
    }

    // @ts-ignore
    req.userId = userId
    next()
  },
)
