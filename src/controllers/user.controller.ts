import { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"
import jwt from "jsonwebtoken"

import { asyncWrapper } from "../utils/async-wrapper"

import {
  loginValidationSchema,
  userValidationSchema,
} from "../helpers/zod-validation"

import { createApiError } from "../utils/ApiError"
import { User } from "../models/user.model"
import { createApiResponse } from "../utils/ApiResponse"

/**
 * Signup Controller
 */
export const signup = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const validUserData = userValidationSchema.parse(req.body)

    // @ts-ignore
    const avatar = req.files?.avatar?.[0]?.path

    // @ts-ignore
    const coverImage = req.files?.coverImage?.[0]?.path

    if (!avatar) {
      return next(
        createApiError(
          "Please select an profile image",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    const user = await User.create({ ...validUserData })

    // @ts-ignore
    await user.uploadAvatar(avatar)

    if (coverImage) {
      // @ts-ignore
      await user.uploadCoverImage(coverImage)
    }

    const {
      password: hash,
      refreshToken: refresh,
      __v,
      ...restOfUser
      // @ts-ignore
    } = user._doc

    // @ts-ignore
    const accessToken = user.generateAccessToken(user._id)

    // @ts-ignore
    const refreshToken = user.generateRefreshToken(user._id)

    await user.save({ validateBeforeSave: false })

    const cookieOptions = { httpOnly: true, secure: true }

    res
      .status(httpStatus.CREATED)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        createApiResponse(
          "User created successfully",
          httpStatus.CREATED,
          true,
          { ...restOfUser, accessToken, refreshToken },
        ),
      )
  },
)

/**
 * Login Controller
 */
export const login = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = loginValidationSchema.parse(req.body)

    const existedUser = await User.findOne({
      $or: [{ username }, { email: username }],
    })

    if (!existedUser) {
      return next(
        createApiError(
          "User does not exist with this username or email",
          httpStatus.NOT_FOUND,
          null,
          [],
        ),
      )
    }

    // @ts-ignore
    const isPasswordCorrect = existedUser.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
      return next(
        createApiError("Invalid credentials", httpStatus.BAD_REQUEST, null, []),
      )
    }

    const {
      password: hash,
      refreshToken: refresh,
      __v,
      ...restOfUser
      // @ts-ignore
    } = existedUser._doc

    // @ts-ignore
    const accessToken = existedUser.generateAccessToken(existedUser._id)

    // @ts-ignore
    const refreshToken = existedUser.generateRefreshToken(existedUser._id)

    await existedUser.save({ validateBeforeSave: false })

    const cookieOptions = { httpOnly: true, secure: true }

    res
      .status(httpStatus.OK)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        createApiResponse("Login successfully", httpStatus.OK, true, {
          ...restOfUser,
          accessToken,
          refreshToken,
        }),
      )
  },
)

/**
 * Logout Controller
 */
export const logout = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(
      // @ts-ignore
      req.userId,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true },
    )

    const cookieOptions = { httpOnly: true, secure: true }

    res
      .status(httpStatus.OK)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(
        createApiResponse(
          "user has been logged out",
          httpStatus.OK,
          true,
          null,
        ),
      )
  },
)

/**
 * Refresh Token Controller
 */
export const refreshToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
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
    const { userId } = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    )

    const user = await User.findById(userId)

    if (!user) {
      return next(
        createApiError(
          "Invalid refresh token or has been expired",
          httpStatus.UNAUTHORIZED,
          null,
          [],
        ),
      )
    }

    // @ts-ignore
    const accessToken = user.generateAccessToken(user._id)

    // @ts-ignore
    const refreshToken = user.generateRefreshToken(user._id)

    await user.save({ validateBeforeSave: false })

    const cookieOptions = { httpOnly: true, secure: true }

    res
      .status(httpStatus.OK)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        createApiResponse("Access Token refreshed", httpStatus.OK, true, null),
      )
  },
)

/**
 * Get Current User Details Controller
 */
export const getCurrentUserDetails = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = await User.findById(req.userId)

    // @ts-ignore
    const { password, refreshToken, __v, ...restOfUser } = user._doc

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Fetched user data successfully",
          httpStatus.OK,
          true,
          { ...restOfUser },
        ),
      )
  },
)

/**
 * Change Password Controller
 */
export const changePassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, retypePassword } = req.body

    if (!password || password.length < 6) {
      return next(
        createApiError(
          "Password must be of at least 6 characters",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    if (password !== retypePassword) {
      return next(
        createApiError(
          "Passwords did not match",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    // @ts-ignore
    const user = await User.findById(req.userId)
    if (!user)
      return next(
        createApiError("Invalid token", httpStatus.UNAUTHORIZED, null, []),
      )

    user.password = password

    user.save({ validateBeforeSave: false })

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Password has been updated successfully",
          httpStatus.OK,
          true,
          null,
        ),
      )
  },
)

import fs from "fs"
export const demo = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.file)
    // throw new Error("Intentional Error")
    fs.unlinkSync(req.file?.path as string)
    res.send(req.file)
  },
)
