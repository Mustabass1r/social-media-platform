import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
    communityName: {
        type: String,
        required: true,
    },
    communityPhoto: {
        type: String,
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    category:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true,
        max: 150,
    }
});


export default mongoose.model('Community', communitySchema);