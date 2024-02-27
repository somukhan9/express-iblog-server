import mongoose, { Document } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary"

interface IUser extends Document {
  name: string
  username: string
  email: string
  password: string
  avatar: {
    publicId: string
    url: string
  }
  coverImage: {
    publicId: string
    url: string
  }
  refreshToken: string
  role: string
  resetPasswordToken: string
  resetPasswordTokenExpiry: Date

  // Schema Methods
  isPasswordCorrect: (password: string) => boolean
  uploadAvatar: (avatarLocalFilePath: string) => Promise<object>
  deleteAvatar: () => Promise<object>
  uploadCoverImage: (coverImageLocalFilePath: string) => Promise<object>
  deleteCoverImage: () => Promise<object>
  generateAccessToken: (userId: string) => string
  generateRefreshToken: (userId: string) => string
  generateResetPasswordToken: () => string
}

const userSchema = new mongoose.Schema<IUser>(
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
    },
    coverImage: {
      publicId: String,
      url: String,
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
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

userSchema.method("deleteAvatar", async function () {
  await deleteFromCloudinary(this.avatar.publicId)
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

userSchema.method("deleteCoverImage", async function () {
  await deleteFromCloudinary(this.coverImage.publicId)
})

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

userSchema.method("generateResetPasswordToken", function () {
  const resetToken = crypto.randomBytes(20).toString("hex")
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
  this.resetPasswordTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

  return resetToken
})

export const User = mongoose.model("User", userSchema)
