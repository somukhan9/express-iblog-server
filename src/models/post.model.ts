import mongoose, { Document } from "mongoose"
import slugify from "slugify"

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
      required: [true, "Post slug is required"],
      unique: true,
    },
    summary: {
      type: String,
      required: [true, "Post summary is required"],
    },
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
    },
  },
  { timestamps: true },
)

postSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next()

  this.slug = slugify(this.title)
  next()
})

export const Post = mongoose.model("Post", postSchema)
