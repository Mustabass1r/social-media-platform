import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    maxlength: 500,
    required: true,
  },
  media: {
    type: String,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Post", postSchema);
