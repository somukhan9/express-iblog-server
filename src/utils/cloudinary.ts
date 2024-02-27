import fs from "fs"

import httpStatus from "http-status"

import { v2 as cloudinary } from "cloudinary"

import { createApiError } from "./ApiError"

/**
 * FUNCTION for uploading file to cloudinary
 */
export const uploadOnCloudinary = async (
  localFilePath: string,
  folder: string = "express-blog/",
) => {
  try {
    if (!localFilePath)
      return createApiError(
        "No file selected",
        httpStatus.BAD_REQUEST,
        null,
        [],
      )

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
    })

    fs.unlinkSync(localFilePath)

    return response

    // this comment is added for making some space between try and catch portion
  } catch (error) {
    console.log(`ERROR: While uploading file to "Cloudinary"\n\n\n`)
    console.error(error)
    fs.unlinkSync(localFilePath)
    return null
  }
}

/**
 * FUNCTION for deleting file from cloudinary
 */
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return null

    const response = await cloudinary.uploader.destroy(publicId, {
      type: "upload",
    })

    // console.log(response)

    return response

    // this comment is added for making some space between try and catch portion
  } catch (error) {
    console.log(`ERROR: While uploading file to "Cloudinary"\n\n\n`)
    console.error(error)
    // fs.unlinkSync(localFilePath)
    return null
  }
}
