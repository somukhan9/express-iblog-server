import mongoose, { Document } from "mongoose"
import slugify from "slugify"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary"

interface IPost extends Document {
  title: string
  slug: string
  summary: string
  body: string
  featuredImage: {
    publicId: string
    url: string
  }
  createdBy: mongoose.Schema.Types.ObjectId
  category: mongoose.Schema.Types.ObjectId

  // Schema methods
  uploadFeaturedImage: (featuredImageLocalPath: string) => Promise<any>
  deleteFeaturedImage: () => Promise<any>
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    summary: { type: String },
    body: {
      type: String,
      required: [true, "Post body is required"],
    },
    featuredImage: {
      publicId: String,
      url: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Post category is required"],
    },
  },
  { timestamps: true },
)

postSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next()

  this.slug = slugify(this.title)
  next()
})

postSchema.pre("save", function (next) {
  if (!this.isModified("body")) return next()

  this.summary = this.body.substring(0, 200)
  next()
})

postSchema.method(
  "uploadFeaturedImage",
  async function (featuredImageLocalPath: string) {
    const response = await uploadOnCloudinary(
      featuredImageLocalPath,
      "express-blog/posts/featuredImages",
    )

    // @ts-ignore
    this.featuredImage.publicId = response!.public_id
    // @ts-ignore
    this.featuredImage.url = response!.secure_url
  },
)

postSchema.method("deleteFeaturedImage", async function () {
  await deleteFromCloudinary(this.featuredImage.publicId)
})

export const Post = mongoose.model("Post", postSchema)
