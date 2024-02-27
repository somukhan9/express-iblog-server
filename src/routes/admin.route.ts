import { Router } from "express"

import {
  deleteUser,
  getAllUser,
  getSingleUser,
  updateUserRole,
} from "../controllers/admin.controller"

import {
  authorizeRole,
  verifyAccessToken,
} from "../middlewares/auth.middleware"

const adminRouter = Router()

adminRouter
  .route("/users")
  .get(verifyAccessToken, authorizeRole("admin"), getAllUser)

adminRouter
  .route("/users/:userId")
  .all(verifyAccessToken, verifyAccessToken)
  .get(getSingleUser)
  .patch(updateUserRole)
  .delete(deleteUser)

export { adminRouter }
