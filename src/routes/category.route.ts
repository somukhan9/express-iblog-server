import { Router } from "express"

import {
  authorizeRole,
  verifyAccessToken,
} from "../middlewares/auth.middleware"
import {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller"

const categoryRouter = Router()

/**
 * Routes related to the Category model
 */
categoryRouter
  .route("/")
  .all(verifyAccessToken, authorizeRole("admin"))
  .get(getAllCategories)
  .post(createCategory)

categoryRouter
  .route("/:categoryId")
  .all(verifyAccessToken, authorizeRole("admin"))
  .get(getSingleCategory)
  .patch(updateCategory)
  .delete(deleteCategory)

export { categoryRouter }
