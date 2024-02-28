import { Router } from "express"

import { verifyAccessToken } from "../middlewares/auth.middleware"
import {
  getAllPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller"
import { upload } from "../middlewares/multer.middleware"

const postRouter = Router()

postRouter
  .route("/")
  .all(verifyAccessToken)
  .get(getAllPosts)
  .post(upload.single("featuredImage"), createPost)

postRouter
  .route("/:postId")
  .all(verifyAccessToken)
  .get(getSinglePost)
  .patch(updatePost)
  .delete(deletePost)

export { postRouter }
