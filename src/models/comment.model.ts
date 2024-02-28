import mongoose, { Document } from "mongoose"

interface IComment extends Document {
  content: string
  createdBy: mongoose.Schema.Types.ObjectId
  post: mongoose.Schema.Types.ObjectId
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true },
)

export const Comment = mongoose.model("Comment", commentSchema)
