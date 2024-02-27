import { Request, Response, NextFunction } from "express"

import httpStatus from "http-status"
import fs from "fs"

export const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let message = err.message || "Internal server error"
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR
  let errors: any = err

  console.log(err.name)

  /**
   * Handling Validation Error (Zod Schema Validation)
   */
  if (err.name === "ZodError") {
    errors = Object.entries(err.errors).map((item: any) => ({
      path: item[1].path[0],
      message: item[1].message,
    }))

    message = errors.map((item: any) => `${item.message}`).join(", ")
    statusCode = httpStatus.BAD_REQUEST

    return res.status(statusCode).json({
      statusCode,
      message,
      success: false,
      errors,
    })
  }

  /**
   * Handling Validation Error (Mongoose Schema Validation)
   */
  if (err.name === "ValidationError") {
    statusCode = httpStatus.BAD_REQUEST

    let testMessage: any = Object.entries(errors)[0][1]
    message = Object.values(testMessage)
      .map((item: any) => item.message)
      .join(", ")

    return res.status(statusCode).json({
      statusCode,
      message,
      success: false,
      errors,
    })
  }

  /**
   * Handling errors which are thrown from ApiError class
   */
  if (err.name === "ApiError") {
    message = err.message
    statusCode = err.statusCode
    errors = []

    return res.status(statusCode).json({
      statusCode,
      message,
      success: false,
      errors,
    })
  }

  /**
   * Handling MongoDB Server Error
   */
  if (err.name === "MongoServerError") {
    if (err.code === 11000) {
      let testMessage: any

      statusCode = httpStatus.BAD_REQUEST
      testMessage = Object.values(err)[Object.values(err).length - 1]
      testMessage = Object.entries(testMessage)[0]
      message = `"${testMessage[1]}" has already taken as ${testMessage[0]}`

      return res.status(statusCode).json({
        statusCode,
        message,
        success: false,
        errors,
      })
    }
  }

  /**
   * Handling TokenExpired Error
   */
  if (err.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED
    message = `Token has been expired`

    return res.status(statusCode).json({
      statusCode,
      message,
      success: false,
      errors,
    })
  }

  /**
   * Handling Json Web Token Error
   */
  if (err.name === "JsonWebTokenError") {
    statusCode = httpStatus.BAD_REQUEST

    return res.status(statusCode).json({
      statusCode,
      message,
      success: false,
      errors,
    })
  }

  /**
   * General purpose error response
   */
  return res.status(statusCode).json({
    statusCode,
    message,
    success: false,
    errors,
  })
}
