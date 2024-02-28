import mongoose, { Document } from "mongoose"
import slugify from "slugify"

interface ICategory extends Document {
  title: string
  slug: string
  createdBy: mongoose.Schema.Types.ObjectId
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    title: {
      type: String,
      required: [true, "Category title is required"],
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

categorySchema.pre("save", function (next) {
  if (!this.isModified("title")) return next()

  this.slug = slugify(this.title)
  next()
})

export const Category = mongoose.model("Category", categorySchema)
