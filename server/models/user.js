import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountCreated: {
        type: Date,
        default: Date.now,
    },
    profilePhoto: {
        type: String,
    },
    ownedCommunities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community',
        },
    ],
    joinedCommunities: [
        {
            type: mongoose.Schema.Types.ObjectId,    
            ref: 'Community',
        },
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
    likedPost: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    repliedPost: [    
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    seenPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
    interestedCategories: [
        {
            type: String,
            required: true
        }
    ],
    notifications:[
        {
            seen:{ type: Boolean, default: false },
            message: { type: String },
            date: { type: Date, default: Date.now },
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
            commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
            replyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
        }
    ]
});

export default mongoose.model('User', userSchema);