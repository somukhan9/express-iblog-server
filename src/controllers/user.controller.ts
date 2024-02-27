import { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"
import jwt from "jsonwebtoken"

import crypto from "crypto"

import { asyncWrapper } from "../utils/async-wrapper"

import {
  loginValidationSchema,
  userValidationSchema,
} from "../helpers/zod-validation"

import { createApiError } from "../utils/ApiError"
import { User } from "../models/user.model"
import { createApiResponse } from "../utils/ApiResponse"
import { sendEmail } from "../utils/send-email"

/**
 * Signup Controller
 */
const signup = asyncWrapper(
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

    await user.uploadAvatar(avatar)

    if (coverImage) {
      await user.uploadCoverImage(coverImage)
    }

    const {
      password: hash,
      refreshToken: refresh,
      __v,
      ...restOfUser
      // @ts-ignore
    } = user._doc

    await user.save({ validateBeforeSave: false })

    res
      .status(httpStatus.CREATED)
      .json(
        createApiResponse(
          "User created successfully",
          httpStatus.CREATED,
          true,
          { ...restOfUser },
        ),
      )
  },
)

/**
 * Login Controller
 */
const login = asyncWrapper(
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

    const accessToken = existedUser.generateAccessToken(existedUser._id)

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
const logout = asyncWrapper(
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
const refreshToken = asyncWrapper(
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
const getCurrentUserDetails = asyncWrapper(
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
const changePassword = asyncWrapper(
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
        createApiError(
          "Token is invalid or has been expired",
          httpStatus.UNAUTHORIZED,
          null,
          [],
        ),
      )

    user.password = password

    await user.save({ validateBeforeSave: false })

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

/**
 * Forgot Password Controller
 */
const forgotPassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body

    if (!email) {
      return next(
        createApiError(
          "Please enter your email address",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    const user = await User.findOne({ email })

    if (!user) {
      return next(
        createApiError(
          "user doesn't exist with this email",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    const resetToken = user.generateResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${req.protocol}://${req.hostname}/user/reset-password/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email, please ignore it.`

    try {
      // TODO: send email
      const options = {
        email,
        subject: `iBlog Reset Password`,
        message,
      }
      sendEmail(options)
      console.log(message)
      return res
        .status(httpStatus.OK)
        .json(
          createApiResponse(
            "Password reset link has been sent to your email",
            httpStatus.OK,
            true,
            null,
          ),
        )
    } catch (error) {
      // Take necessary steps if email is not sent
      console.error(`Error while sending reset password email: \n\n${error}`)
      await User.findOneAndUpdate(
        { email },
        {
          $unset: {
            resetPasswordToken: 1,
            resetPasswordTokenExpiry: 1,
          },
        },
        { new: true },
      )
      return next(
        createApiError(
          "Email could not be sent. Please check your credentials",
          httpStatus.INTERNAL_SERVER_ERROR,
          null,
          error,
        ),
      )
    }
  },
)

/**
 * Reset Password Controller
 */
const resetPassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params
    const { password, retypePassword } = req.body

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return next(
        createApiError(
          "Reset password token is invalid or has been expired",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    if (!password || password.length < 6) {
      return next(
        createApiError(
          "Password must of 6 characters at least",
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

    user.password = password
    await user.save({ validateBeforeSave: false })

    await user.updateOne({
      $unset: { resetPasswordToken: 1, resetPasswordTokenExpiry: 1 },
    })

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Password has been reset successfully. You can now login",
          httpStatus.OK,
          true,
          null,
        ),
      )
  },
)

/**
 * Update profile controller
 */
const updateProfile = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.userId

    const { name, username, email } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          username,
          email,
        },
      },
      { new: true, runValidators: true },
    )

    // @ts-ignore
    const { password, refreshToken, __v, ...restOfUser } = updatedUser._doc

    res.status(httpStatus.OK).json(
      createApiResponse("Profile updated successfully", httpStatus.OK, true, {
        ...restOfUser,
      }),
    )
  },
)

/**
 * Update Avatar Controller
 */
const updateAvatar = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.userId
    const avatar = req.file?.path

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

    const user = await User.findById(userId)

    if (!user) {
      return next(
        createApiError(
          "Token is invalid or has been expired",
          httpStatus.UNAUTHORIZED,
          null,
          [],
        ),
      )
    }

    // First deleting the existing one, then uploading the new one

    await user.deleteAvatar()

    await user.uploadAvatar(avatar)

    await user.save({ validateBeforeSave: false })

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Profile image updated successfully",
          httpStatus.OK,
          true,
          null,
        ),
      )
  },
)

/**
 * Update Cover Image Controller
 */
const updateCoverImage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.userId
    const coverImage = req.file?.path

    if (!coverImage) {
      return next(
        createApiError(
          "Please select an cover image",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    const user = await User.findById(userId)

    if (!user) {
      return next(
        createApiError(
          "Token is invalid or has been expired",
          httpStatus.UNAUTHORIZED,
          null,
          [],
        ),
      )
    }

    // First deleting the existing one, then uploading the new one

    await user.deleteCoverImage()

    await user.uploadCoverImage(coverImage)

    await user.save({ validateBeforeSave: false })

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Cover image updated successfully",
          httpStatus.OK,
          true,
          null,
        ),
      )
  },
)

/**
 * Demo controller for testing of removing single file saved by multer
 */
import fs from "fs"
const demo = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.file)
    // throw new Error("Intentional Error")
    fs.unlinkSync(req.file?.path as string)
    res.send(req.file)
  },
)

/**
 * Exporting all the controllers
 */
export {
  signup,
  login,
  logout,
  refreshToken,
  getCurrentUserDetails,
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  demo,
}
