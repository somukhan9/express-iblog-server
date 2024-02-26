import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import { uploadOnCloudinary } from "../utils/cloudinary"

type User = {
  name: string
  username: string
  email: string
  password: string
  avatar: string
  coverImage: string
  refreshToken: string
}

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Please provide username"],
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please provide username"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
    },
    avatar: {
      publicId: String,
      url: String,

      // required: [true, "Please give an profile image"],
      // Manually made it required
    },
    coverImage: {
      publicId: String,
      url: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
)

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next()

  const salt = bcrypt.genSaltSync(10)
  this.password = bcrypt.hashSync(this.password, salt)
  next()
})

userSchema.method("isPasswordCorrect", function (password: string) {
  // @ts-ignore
  return bcrypt.compareSync(password, this.password)
})

userSchema.method("uploadAvatar", async function (avatarLocalFilePath: string) {
  const response = await uploadOnCloudinary(
    avatarLocalFilePath,
    "express-blog/users/avatar",
  )

  // @ts-ignore
  this.avatar.publicId = response!.public_id
  // @ts-ignore
  this.avatar.url = response!.secure_url
})

userSchema.method(
  "uploadCoverImage",
  async function (coverImageLocalFilePath: string) {
    const response = await uploadOnCloudinary(
      coverImageLocalFilePath,
      "express-blog/users/coverImage",
    )

    // @ts-ignore
    this.coverImage.publicId = response!.public_id
    // @ts-ignore
    this.coverImage.url = response!.secure_url
  },
)

userSchema.method("generateAccessToken", function (userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  })

  return accessToken
})

userSchema.method("generateRefreshToken", function (userId: string) {
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  })

  this.refreshToken = refreshToken

  return refreshToken
})

export const User = mongoose.model("User", userSchema)
