import { Router } from "express";
import {
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
} from "../controllers/userPostController.js";

const router = Router();

router.post("/seen", addSeenPost);

router.get("/posts", getUserPosts);

router.get("/likedPosts", getLikedPosts);

router.post("/addComment", addComment);

router.post("/getComments", getComments);

router.post("/addPostLike", addPostLike);

router.delete("/deletePostLike", deletePostLike);

router.post("/addCommentLike", addCommentLike);

router.delete("/deleteCommentLike", deleteCommentLike);

router.delete("/deleteComment", deleteComment);

router.post("/addReply", addReply);

router.delete("/deleteReply", deleteReply);

router.post("/addReplyLike", addReplyLike);

router.delete("/deleteReplyLike", deleteReplyLike);

router.post("/getPostsForHome", getPostsForHome);

router.post("/checkIfUserLikedPost", checkIfUserLikedPost);

export default router;
