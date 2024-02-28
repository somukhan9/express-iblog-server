import { Request, Response, NextFunction } from "express"
import { asyncWrapper } from "../utils/async-wrapper"
import { Post } from "../models/post.model"
import { createApiError } from "../utils/ApiError"
import httpStatus from "http-status"
import { createApiResponse } from "../utils/ApiResponse"
import { postValidationSchema } from "../helpers/zod-validation"

/**
 * Get All Post controller
 */
const getAllPosts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {},
)

/**
 * Get Single Post controller
 */
const getSinglePost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params

    const post = await Post.findById(postId).select("-__v")

    if (!post) {
      return next(
        createApiError("Post does not exists", httpStatus.NOT_FOUND, null, []),
      )
    }

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Fetched single post successfully",
          httpStatus.OK,
          true,
          post,
        ),
      )
  },
)

/**
 * Create Post controller
 */
const createPost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = postValidationSchema.parse(req.body)

    const featuredImage = req.file?.path

    if (!featuredImage) {
      return next(
        createApiError(
          "Please select a featured image",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )
    }

    const post = await Post.create(validatedData)

    // @ts-ignore
    post.createdBy = req.userId

    await post.uploadFeaturedImage(featuredImage)

    await post.save({ validateBeforeSave: false })

    // @ts-ignore
    const { __v, ...restOfPost } = post._doc

    res
      .status(httpStatus.CREATED)
      .json(
        createApiResponse(
          "Post created successfully",
          httpStatus.CREATED,
          true,
          restOfPost,
        ),
      )
  },
)

/**
 * Update Post controller
 */
const updatePost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {},
)

/**
 * Delete Post controller
 */
const deletePost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {},
)

export { getAllPosts, getSinglePost, createPost, updatePost, deletePost }
