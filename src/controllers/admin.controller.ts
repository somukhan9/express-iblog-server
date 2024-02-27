import { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"

import { asyncWrapper } from "../utils/async-wrapper"
import { createApiError } from "../utils/ApiError"
import { User } from "../models/user.model"
import { createApiResponse } from "../utils/ApiResponse"

const getAllUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({})

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse("Fetched all the users", httpStatus.OK, true, users),
      )
  },
)

const getSingleUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
      return next(
        createApiError("User does not exists", httpStatus.NOT_FOUND, null, []),
      )
    }

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "User fetched successfully",
          httpStatus.OK,
          true,
          user,
        ),
      )
  },
)

const updateUserRole = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    const { role } = req.body

    const user = await User.findById(userId)

    if (!user) {
      return next(
        createApiError("User does not exists", httpStatus.NOT_FOUND, null, []),
      )
    }

    await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true, runValidators: true },
    )

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Update user role updated successfully",
          httpStatus.OK,
          true,
          null,
        ),
      )
  },
)

const deleteUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
      return next(
        createApiError("User does not exists", httpStatus.NOT_FOUND, null, []),
      )
    }

    await User.findByIdAndDelete(userId)

    res
      .status(httpStatus.NO_CONTENT)
      .json(
        createApiResponse(
          "User deleted successfully",
          httpStatus.NO_CONTENT,
          true,
          null,
        ),
      )
  },
)

export { getAllUser, getSingleUser, updateUserRole, deleteUser }
