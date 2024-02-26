import { Router } from "express"

import {
  signup,
  login,
  logout,
  refreshToken,
  getCurrentUserDetails,
  changePassword,
  demo,
} from "../controllers/user.controller"

import { upload } from "./../middlewares/multer.middleware"
import { verifyAccessToken } from "../middlewares/auth.middleware"
import { cleanUpFilesFromServer } from "../middlewares/cleanup.middleware"

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

// Only for testing of some corner case
userRouter.route("/demo").post(upload.single("demo"), demo)

export { userRouter }
