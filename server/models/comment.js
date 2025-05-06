import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    replies: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          likes: { type: Number, default: 0 },
          likedBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: [], // Default to an empty array
          },
        }
      ],
      
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Comment', commentSchema);