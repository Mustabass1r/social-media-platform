import Post from "../models/post.js";
import User from "../models/user.js";
import Comment from "../models/comment.js";
import mongoose from "mongoose";
import Community from "../models/community.js";

const addSeenPost = async (req, res) => {
  try {
    console.log("Received request to add to seen posts");
    const { userId } = req.body;
    const { postId } = req.body;

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.seenPosts.includes(postId)) {
      return res.status(400).json({ message: "Post already marked as seen" });
    }

    user.seenPosts.push(postId);
    await user.save();
    return res
      .status(200)
      .json({ message: "Post marked as seen successfully" });
  } catch (error) {
    console.error("Error adding to seen posts:", error);
    return res
      .status(500)
      .json({ message: "Error adding to seen posts", error: error.message });
  }
};






const getPostsForHome = async (req, res) => {
  try {
    const { userId } = req.body; // Get the user ID from the request body

    const user = await User.findById(userId).select('joinedCommunities seenPosts interestedCategories');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    let posts;

    if (user.joinedCommunities.length === 0) {
      const matchingCommunities = await Community.find({
        category: { $in: user.interestedCategories || [] }, // Communities in the user's interested categories
      });

      posts = await Post.find({
        communityId: { $in: matchingCommunities.map(community => community._id) }, // Get posts from the matched communities
        _id: { $nin: user.seenPosts }, // Filter out the posts the user has already seen
      })
        .sort({ likedBy: -1 }) // Sort by the number of likes (most liked first)
        .limit(20) // Limit to 20 posts
        .populate('communityId', 'communityName communityPhoto') // Populate community details
        .populate('userId', 'username profilePhoto') // Populate user details (post owner)
        .lean(); // Fetch plain JavaScript objects for performance\
    } else {
      posts = await Post.find({
        communityId: { $in: user.joinedCommunities }, // Communities the user has joined
        _id: { $nin: user.seenPosts }, // Posts the user hasn't seen
      })
        .sort({ uploadTime: -1 }) // Sort by upload time (newest first)
        .limit(20) // Limit to 20 posts
        .populate('communityId', 'communityName communityPhoto') // Populate community details
        .populate('userId', 'username profilePhoto') // Populate user details (post owner)
        .lean(); // Fetch plain JavaScript objects for performance
    }
    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Error getting posts for home:', error);
    return res.status(500).json({ message: 'Error getting posts for home', error: error.message });
  }
};


const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from the request body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).populate("posts");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ posts: user.posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const addPostLike = async (req, res) => {
  try {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res.status(400).json({ message: "Missing userId or postId" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedPost: postId } }, // Avoid duplicates
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likedBy: userId },
        $inc: { likes: 1 },
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    } 

    postUser.notifications.push({ message: `${user.username} liked your post`, date: new Date() , postId: post._id });
    await postUser.save();

    return res.status(200).json({ user, post });
  } catch (err) {
    console.error("Error adding like:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
};

const deletePostLike = async (req, res) => {

  try {
    const { userId, postId } = req.query;

    if (!userId || !postId) {
      return res.status(400).json({ message: "Missing userId or postId" });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likedBy: userId },
        $inc: { likes: -1 }, // Decrement likes atomically
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { likedPost: postId } }, // Remove postId from likedPost array
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    }


    
    await postUser.save();

    return res.status(200).json({ user, post });
  } catch (err) {
    console.error("Error removing like:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
};


const addCommentLike = async (req, res) => {
  try {
    const { userId, commentId } = req.body;

    if (!userId || !commentId) {
      return res.status(400).json({ message: "Missing userId or commentId" });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid commentId" });
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $addToSet: { likedBy: userId },
        $inc: { likes: 1 },
      },
      { 
        new: true,
        populate: {
          path: 'userId',
          select: 'username profilePhoto'
        }
      }
    ).populate({
      path: 'replies.userId',
      select: 'username profilePhoto'
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const commentUser = await User.findById(comment.userId);
    if (!commentUser) {
      return res.status(404).json({ message: "Comment user not found" });
    }
    commentUser.notifications.push({ message: `${comment.userId.username} liked your comment`, date: new Date() , commentId: comment._id });
    await commentUser.save();

    return res.status(200).json({ comment });
  } catch (err) {
    console.error("Error adding like:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
};

const deleteCommentLike = async (req, res) => {
  try {
    const { userId, commentId } = req.query;

    if (!userId || !commentId) {
      return res.status(400).json({ message: "Missing userId or commentId" });
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid commentId" });
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $pull: { likedBy: userId },
        $inc: { likes: -1 },
      },
      { 
        new: true,
        populate: { 
          path: 'userId',
          select: 'username profilePhoto'
        }
      }
    ).populate({
      path: 'replies.userId',
      select: 'username profilePhoto'
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const commentUser = await User.findById(comment.userId);
    if (!commentUser) {
      return res.status(404).json({ message: "Comment user not found" });
    }
    
    await commentUser.save();

    res.status(200).json({ comment });
  } catch (err) {
    console.error("Error removing like:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};
const getLikedPosts = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).populate("likedPost");

    if (!user) {
      return res.status(404).json({ message: "Error 404: User not found" });
    }
    const post = user.likedPost;
    return res.status(200).json({ post });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};


const addComment = async (req, res) => {
  try {
    const { postId, userId, text } = req.body;

    if (!userId || !postId || !text) {
      return res.status(400).send("Missing required fields");
    }

    const newComment = new Comment({
      userId,
      postId,
      text,
      createdAt: Date.now(),
    });
    newComment.save();
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { comments: newComment._id },
      },
      { new: true }
    );
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { comments: newComment._id },
      },
      { new: true }
    );
    const comment = await Comment.findById(newComment._id).populate("userId" , "username profilePhoto");

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    }
    postUser.notifications.push({ message: `${user.username} commented on your post`, date: new Date() , postId: post._id });
    await postUser.save();

    return res.status(200).json({ comment });
  } catch (err) {
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    let comment = await Comment.findById(commentId);
    const post = await Post.findByIdAndUpdate(
      comment.postId,
      {
        $pull: {
          comments: commentId,
        },
      },
      { new: true }
    );
    const user = await User.findByIdAndUpdate(
      comment.userId,
      {
        $pull: {
          comments: commentId,
          repliedPost: commentId,
        },
      },
      { new: true } // Return the updated document
    );
    comment = await Comment.findByIdAndDelete(commentId);

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    }
   
    await postUser.save();

    return res.status(200).json({ comment, user, post });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
};

const addReply = async (req, res) => {
  try {
    const { userId, postId, commentId, text } = req.body;

    if (!userId || !postId || !commentId || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reply = {
      userId: user._id,
      text,
      createdAt: new Date(),
      likes: 0,
      likedBy: [],
    };

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $push: { replies: reply } },
      { new: true }
    ).populate({
      path: 'userId',
      select: 'username profilePhoto'
    }).populate({
      path: 'replies.userId',
      select: 'username profilePhoto'
    });

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { repliedPost: commentId } }
    );

    const formattedComment = {
      ...updatedComment.toObject(),
      replies: updatedComment.replies.map(reply => ({
        ...reply.toObject(),
        userId: reply.userId ? {
          _id: reply.userId._id,
          username: reply.userId.username,
          profilePhoto: reply.userId.profilePhoto
        } : null
      }))
    };

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    }
    postUser.notifications.push({ message: `${user.username} replied to your comment`, date: new Date() , commentId: commentId });
    await postUser.save();

    return res.status(200).json({ comment: formattedComment });
  } catch (err) {
    console.error("Error in addReply:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};




const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId, userId } = req.query;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id.toString() === replyId && reply.userId.toString() === userId
    );
    if (replyIndex === -1) {
      return res.status(404).json({ message: "Reply not found or user not authorized" });
    }

    comment.replies.splice(replyIndex, 1);

    await comment.save();

    const post = await Post.findById(comment.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    }
   
    await postUser.save();

    return res.status(200).json({ message: "Reply deleted successfully", comment });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ message: "Error deleting reply", error: error.message });
  }
};







const addReplyLike = async (req, res) => {
  try {
    const { commentId, userId, replyId } = req.body;

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId, "replies._id": replyId },
      {
        $inc: { "replies.$.likes": 1 },
        $addToSet: { "replies.$.likedBy": userId },
      },
      { new: true }
    ).populate({
      path: 'replies.userId',
      select: 'username profilePhoto'
    });

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment or reply not found" });
    }

    const updatedReply = updatedComment.replies.find(reply => reply._id.toString() === replyId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(updatedComment.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    }
    postUser.notifications.push({ message: `${user.username} liked your reply`, date: new Date() , replyId: replyId });
    await postUser.save();

    return res.status(200).json({
      message: "Reply liked successfully",
      reply: updatedReply
    });
  } catch (err) {
    console.error("Error in addReplyLike:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
};

const deleteReplyLike = async (req, res) => {
  try {
    const { commentId, userId, replyId } = req.query;

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId, "replies._id": replyId },
      {
        $inc: { "replies.$.likes": -1 }, // Decrement the likes count for the specific reply
        $pull: { "replies.$.likedBy": userId }, // Remove the userId from the likedBy array for the specific reply
      },
      { new: true } // Return the updated document
    ).populate({
      path: 'replies.userId',
      select: 'username profilePhoto',
    });

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment or reply not found" });
    }

    const updatedReply = updatedComment.replies.find(reply => reply._id.toString() === replyId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(updatedComment.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postUser = await User.findById(post.userId);
    if (!postUser) {
      return res.status(404).json({ message: "Post user not found" });
    } 
    
    await postUser.save();

    return res.status(200).json({
      message: "Reply unliked successfully",
      reply: updatedReply,
    });
  } catch (err) {
    console.error("Error in deleteReplyLike:", err);
    return res.status(500).json({ message: "Server Error: " + err.message });
  }
};




const getComments = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId)
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'userId',
            select: 'username profilePhoto',
          },
          {
            path: 'replies',
            populate: {
              path: 'userId',
              select: 'username profilePhoto',
            },
          },
        ],
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ comments: post.comments });
  } catch (err) {
    console.error("Error in getComments:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};


const checkIfUserLikedPost = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    const isLiked = post.likedBy.includes(userId);
    return res.status(200).json({ isLiked});
  } catch (err) {
    console.error("Error in checkIfUserLikedPost:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};


export {
  addSeenPost,
  getUserPosts,
  getLikedPosts,
  addPostLike,
  addComment,
  getComments,
  deletePostLike,
  addCommentLike,
  deleteCommentLike,
  deleteComment,
  addReply,
  deleteReply,
  addReplyLike,
  deleteReplyLike,
  getPostsForHome,
  checkIfUserLikedPost
};

