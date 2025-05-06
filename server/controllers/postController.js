import Post from "../models/post.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import user from "../models/user.js";
import community from "../models/community.js";
import comment from "../models/comment.js";
import mongoose from "mongoose";

dotenv.config();

cloudinary.config({
  cloud_name: "dnjhynhiz",
  api_key: "218784618617246",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Configuration:", {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  api_secret: cloudinary.config().api_secret ? "Set" : "Not Set",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "post_media",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

const createPost = async (req, res) => {
  console.log("Received request to create post");
  upload.single("media")(req, res, async function (err) {
    if (err) {
      console.error("Error uploading file:", err);
      return res
        .status(400)
        .json({ message: "Error uploading file", error: err.message });
    }

    console.log("Request body after multer:", req.body);
    console.log("File after multer:", req.file);

    try {
      const { description, communityId, userId } = req.body;

      if (!description || !communityId || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let mediaUrl = "";
      if (req.file) {
        mediaUrl = req.file.path; 
      }

      const newPost = new Post({
        description,
        communityId,
        userId,
        media: mediaUrl || null,
        likes: 0,
        comments: [],
      });

      const savedPost = await newPost.save();
      console.log("Post saved successfully:", savedPost);
      savedPost.populate("userId", "username profilePhoto");
      res.status(201).json(savedPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res
        .status(500)
        .json({ message: "Error creating post", error: error.message });
    }
  });
};

const getMyPosts = async (req, res) => {
  try {
    const { userId } = req.query;
    const { page = 1, limit = 20 } = req.query;

    console.log("Fetching posts for user:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "username profilePhoto") 
      .populate("communityId", "communityName communityPhoto")
      .lean();

    console.log(`Fetched ${posts.length} posts for user: ${userId}`);

    const totalPosts = await Post.countDocuments({ userId });

    const pagination = {
      totalPosts,
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    console.log("Pagination:", pagination);

    res.status(200).json({ posts, pagination });
  } catch (error) {
    console.error("Error getting my posts:", error);
    res.status(500).json({
      message: "Server error while fetching posts",
      error: error.message,
    });
  }
};

const getMyLikedPosts = async (req, res) => {
  try {
    const { userId } = req.query;
    const { page = 1, limit = 20 } = req.query;

    console.log("Fetching liked posts for user:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find({ likedBy: userId })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "username profilePhoto") 
      .populate("communityId", "communityName communityPhoto")
      .lean();

    console.log(`Fetched ${posts.length} liked posts for user: ${userId}`);

    const totalPosts = await Post.countDocuments({ likedBy: userId });

    const pagination = {
      totalPosts,
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    console.log("Pagination:", pagination);

    res.status(200).json({ posts, pagination });
  } catch (error) {
    console.error("Error getting my liked posts:", error);
    res.status(500).json({
      message: "Server error while fetching liked posts",
      error: error.message,
    });
  }
};

const getMyCommentedPosts = async (req, res) => {
  try {
    const { userId } = req.query;
    const { page = 1, limit = 20 } = req.query;

    console.log("Fetching commented posts for user:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await comment.find({ userId: userId });

    if (!comments || comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this user" });
    }

    const postIds = comments.map((comment) => comment.postId);

    const posts = await Post.find({ _id: { $in: postIds } })
      .skip(skip) // Apply pagination skip
      .limit(parseInt(limit)) // Apply pagination limit
      .populate("userId", "username profilePhoto") // Populate user details for the post
      .populate("communityId", "communityName communityPhoto"); // Populate community details for the post

    console.log(`Fetched ${posts.length} commented posts for user: ${userId}`);

    const totalPosts = await Post.countDocuments({ _id: { $in: postIds } });

    const pagination = {
      totalPosts,
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    };

    console.log("Pagination:", pagination);

    res.status(200).json({ posts, pagination });
  } catch (error) {
    console.error("Error getting my commented posts:", error);
    res.status(500).json({
      message: "Server error while fetching commented posts",
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId, userId } = req.query;

    const post = await Post.findOne({ _id: postId, userId });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or user not authorized" });
    }

    if (post.media) {
      const mediaPublicId = post.media.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(mediaPublicId);
        console.log(`Media ${mediaPublicId} deleted from Cloudinary`);
      } catch (deleteError) {
        console.error("Error deleting media from Cloudinary:", deleteError);
        return res.status(500).json({
          message: "Error deleting media from Cloudinary",
          error: deleteError.message,
        });
      }
    }

    await comment.deleteMany({ postId: postId });

    await community.updateMany({ posts: postId }, { $pull: { posts: postId } });

    await user.updateMany(
      { $or: [{ posts: postId }, { likedPost: postId }] },
      { $pull: { posts: postId, likedPost: postId } }
    );

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId, userId } = req.query;

    const commentToDelete = await comment.findOne({ _id: commentId, userId });
    if (!commentToDelete) {
      return res
        .status(404)
        .json({ message: "Comment not found or user not authorized" });
    }

    await user.updateMany(
      { repliedPost: commentId },
      { $pull: { repliedPost: commentId } }
    );

    await Post.findByIdAndUpdate(commentToDelete.postId, {
      $pull: { comments: commentId },
    });

    await user.findByIdAndUpdate(commentToDelete.userId, {
      $pull: { comments: commentId },
    });

    await comment.findByIdAndDelete(commentId);

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
};

const searchPosts = async (req, res) => {
  try {
    const searchValue = decodeURIComponent(req.query.searchValue || '');
    const escapedSearchValue = escapeRegex(searchValue); // Escape special characters in the search value

    const posts = await Post.find({
      description: { $regex: escapedSearchValue, $options: "i" }, // Search in description using escaped regex
    })
      .populate("userId", "username profilePhoto")
      .populate("communityId", "communityName communityPhoto");

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error searching posts:", error);
    res
      .status(500)
      .json({ message: "Error searching posts", error: error.message });
  }
};


export {
  createPost,
  getMyPosts,
  getMyLikedPosts,
  getMyCommentedPosts,
  deletePost,
  deleteComment,
  searchPosts
};
