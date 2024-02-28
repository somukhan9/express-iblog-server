import { Request, Response, NextFunction } from "express"
import httpStatus from "http-status"

import { asyncWrapper } from "../utils/async-wrapper"
import { createApiError } from "../utils/ApiError"
import { createApiResponse } from "../utils/ApiResponse"
import { Category } from "../models/category.model"

const getCategories = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.find({}).select("-__v")

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Fetched all the categories",
          httpStatus.OK,
          true,
          categories,
        ),
      )
  },
)

const getSingleCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params

    const category = await Category.findById(categoryId).select("-__v")

    if (!category) {
      return next(
        createApiError(
          "Category does not exists",
          httpStatus.NOT_FOUND,
          null,
          [],
        ),
      )
    }

    res
      .status(httpStatus.OK)
      .json(
        createApiResponse(
          "Fetched all the categories",
          httpStatus.OK,
          true,
          category,
        ),
      )
  },
)

const createCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title }: { title: string } = req.body
    if (!title)
      return next(
        createApiError(
          "Category title is required",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )

    const category = await Category.create({ title })

    // @ts-ignore
    category.createdBy = req.userId

    await category.save({ validateBeforeSave: false })

    // @ts-ignore
    const { __v, ...restOfCategory } = category._doc

    res
      .status(httpStatus.CREATED)
      .json(
        createApiResponse(
          "Category created successfully",
          httpStatus.CREATED,
          true,
          restOfCategory,
        ),
      )
  },
)

const updateCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params
    const { title } = req.body

    let category = await Category.findById(categoryId)

    if (!category) {
      return next(
        createApiError(
          "Category does not exists",
          httpStatus.NOT_FOUND,
          null,
          [],
        ),
      )
    }

    if (!title)
      return next(
        createApiError(
          "Category title is required",
          httpStatus.BAD_REQUEST,
          null,
          [],
        ),
      )

    category = await Category.findByIdAndUpdate(
      categoryId,
      { $set: { title } },
      { new: true, runValidators: true },
    )

    res
      .status(httpStatus.CREATED)
      .json(
        createApiResponse(
          "Category updated successfully",
          httpStatus.CREATED,
          true,
          category,
        ),
      )
  },
)

const deleteCategory = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params

    const category = await Category.findById(categoryId)

    if (!category) {
      return next(
        createApiError(
          "Category does not exists",
          httpStatus.NOT_FOUND,
          null,
          [],
        ),
      )
    }

    await Category.findByIdAndDelete(categoryId)
    res
      .status(httpStatus.NO_CONTENT)
      .json(
        createApiResponse(
          "Category updated successfully",
          httpStatus.NO_CONTENT,
          true,
          null,
        ),
      )
  },
)

export {
  getCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
}
