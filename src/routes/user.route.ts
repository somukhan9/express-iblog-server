import { Router } from "express"

import {
  signup,
  login,
  logout,
  refreshToken,
  getCurrentUserDetails,
  changePassword,
  demo,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller"

import { verifyAccessToken } from "../middlewares/auth.middleware"

import { upload } from "./../middlewares/multer.middleware"

const userRouter = Router()

userRouter.route("/signup").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  signup,
)

userRouter.route("/login").post(upload.any(), login)

userRouter.route("/logout").get(verifyAccessToken, logout)

userRouter.route("/refresh-token").post(refreshToken)

userRouter.route("/profile").get(verifyAccessToken, getCurrentUserDetails)

userRouter
  .route("/change-password")
  .post(verifyAccessToken, upload.any(), changePassword)

userRouter.route("/forgot-password").post(forgotPassword)

userRouter.route("/reset-password/:token").get(resetPassword)

userRouter.route("/update-profile").patch(verifyAccessToken, updateProfile)

userRouter
  .route("/update-avatar")
  .patch(verifyAccessToken, upload.single("avatar"), updateAvatar)

userRouter
  .route("/update-coverImage")
  .patch(verifyAccessToken, upload.single("coverImage"), updateCoverImage)

// Only for testing of some corner case
userRouter.route("/demo").post(upload.single("demo"), demo)

export { userRouter }
