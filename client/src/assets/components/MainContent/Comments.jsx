import React, { useRef, useState, useCallback, useEffect } from "react";
import axios from "axios";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/joy/Button";
import Fab from "@mui/material/Fab";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/joy/Stack";
import LikeButton from "./LikeButton";
import "./Comments.css";

function Comments({ postId, open, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const [placeholder, setPlaceholder] = useState("Write a comment...");
  const [showReplies, setShowReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/userPost/getComments",
        { postId }
      );

      const allComments = response.data.comments;
      const currentUserId = JSON.parse(localStorage.getItem("user")).id;

      // Separate user comments and other comments
      const userComments = allComments.filter(comment => comment.userId._id === currentUserId);
      const otherComments = allComments.filter(comment => comment.userId._id !== currentUserId);

      // Sort other comments by likes count
      otherComments.sort((a, b) => (b.likes || 0) - (a.likes || 0));

      // Combine user comments and sorted other comments
      const sortedComments = [...userComments, ...otherComments];

      setComments(sortedComments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, fetchComments]);

  const toggleReplies = useCallback((commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const handleReply = useCallback((commentId, username) => {
    setReplyingTo(commentId);
    setPlaceholder(`Replying to ${username}`);
    inputRef.current?.focus();
  }, []);

  const handleAddComment = useCallback(
    async (content) => {
      try {
        const response = await axios.post(
          "http://localhost:3000/userPost/addComment",
          {
            postId,
            userId: JSON.parse(localStorage.getItem("user")).id,
            text: content,
          }
        );
        setComments((prevComments) => [response.data.comment, ...prevComments]);
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },
    [postId]
  );

  const handleAddReply = useCallback(
    async (commentId, content) => {
      try {
        const response = await axios.post(
          "http://localhost:3000/userPost/addReply",
          {
            userId: JSON.parse(localStorage.getItem("user")).id,
            postId,
            commentId,
            text: content,
          }
        );
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  replies: [
                    {
                      ...response.data.comment.replies[
                        response.data.comment.replies.length - 1
                      ],
                      text: content,
                      userId: {
                        _id: JSON.parse(localStorage.getItem("user")).id,
                        username: JSON.parse(localStorage.getItem("user")).username,
                        profilePhoto: JSON.parse(localStorage.getItem("user")).profilePhoto,
                      },
                    },
                    ...comment.replies,
                  ],
                }
              : comment
          )
        );
        console.log(response.data.comment.replies);
      } catch (error) {
        console.error("Error adding reply:", error);
      }
    },
    [postId]
  );

  const handleLikeComment = useCallback(async (commentId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user")).id;
  
      // Find the comment
      const comment = comments.find((comment) => comment._id === commentId);
  
      if (!comment) {
        console.error(`Comment with ID ${commentId} not found`);
        return;
      }
  
      console.log("Comment ID:", commentId + " User ID:", userId);

      // Check if the comment is already liked by the user
      const isLiked = comment.likedBy && comment.likedBy.includes(userId);
  
      let response;
      try {
        if (!isLiked) {
          // Add like
          response = await axios.post(
            "http://localhost:3000/userPost/addCommentLike",
            {
              userId,
              commentId,
            }
          );
        } else {
          // Remove like
          response = await axios.delete(
            "http://localhost:3000/userPost/deleteCommentLike",
            {
              params: {
                commentId,
                userId,
              },
            }
          );
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error(
            "Comment like endpoint not found. Please check your server configuration."
          );
          return;
        }
        throw error; // Re-throw other errors to be caught by the outer catch block
      }
  
      // Update the comment with the response
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? response.data.comment : comment
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error);
      // Optionally, update the UI to show an error message to the user
    }
  }, [comments]);

  const handleLikeReply = useCallback(
    async (commentId, replyId) => {
      try {
        const userId = JSON.parse(localStorage.getItem("user")).id;
        const comment = comments.find((comment) => comment._id === commentId);

        if (!comment) {
          console.error(`Comment with ID ${commentId} not found`);
          return;
        }

        const reply = comment.replies.find((reply) => reply._id === replyId);

        if (!reply) {
          console.error(
            `Reply with ID ${replyId} not found in comment ${commentId}`
          );
          return;
        }

        const isLiked = reply.likedBy && reply.likedBy.includes(userId);

        let response;
        try {
          if (!isLiked) {
            // Add like
            response = await axios.post(
              "http://localhost:3000/userPost/addReplyLike",
              {
                commentId,
                userId,
                replyId,
              }
            );
          } else {
            // Remove like
            response = await axios.delete(
              "http://localhost:3000/userPost/deleteReplyLike",
              {
                params: {
                  commentId,
                  userId,
                  replyId,
                },
              }
            );
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.error(
              "Reply like endpoint not found. Please check your server configuration."
            );
            // Optionally, update the UI to show an error message to the user
            return;
          }
          throw error; // Re-throw other errors to be caught by the outer catch block
        }

        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply._id === replyId ? response.data.reply : reply
                ),
              };
            }
            return comment;
          })
        );
      } catch (error) {
        console.error("Error liking reply:", error);
        // Optionally, update the UI to show an error message to the user
      }
    },
    [comments]
  );

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user")).id;
      await axios.delete(`http://localhost:3000/posts/deleteComment`, {
        params: { commentId,userId  }
      });
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);

      console.log(error.message , error.stack);
    }
  }, []);

  const handleDeleteReply = useCallback(async (commentId, replyId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user")).id;
      await axios.delete(`http://localhost:3000/userPost/deleteReply`, {
        params: {   commentId, replyId , userId }
      });
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== replyId),
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  }, []);

  const postComment = useCallback(() => {
    const commentContent = inputRef.current?.value.trim();
    if (!commentContent) {
      setPlaceholder("Write a comment...");
      return;
    }

    if (replyingTo) {
      handleAddReply(replyingTo, commentContent);
    } else {
      handleAddComment(commentContent);
    }

    inputRef.current.value = "";
    setPlaceholder("Write a comment...");
    setReplyingTo(null);
  }, [replyingTo, handleAddComment, handleAddReply]);

  const renderComment = useCallback(
    (comment, isReply = false) => {
      if (!comment) return null;

      const author = comment.userId || {};
      const username = author.username || "Anonymous";
      const profilePhoto = author.profilePhoto || "/default-avatar.png";
      const userId = JSON.parse(localStorage.getItem("user")).id;
      const isLiked = comment.likedBy && comment.likedBy.includes(userId);
      const isCurrentUserComment = author._id === userId;

      return (
        <div key={comment._id} className={isReply ? "reply" : "comment"}>
          <div className={`${isReply ? "reply" : "comment"}-header`}>
            <div className={`${isReply ? "reply" : "comment"}-author-info`}>
              <img
                src={profilePhoto}
                alt={username}
                className="author-avatar"
              />
              <div className={`${isReply ? "reply" : "comment"}-author`}>
                {username}
              </div>
              {isCurrentUserComment && (
              <Button
                variant="plain"
                color="neutral"
                onClick={() => isReply ? handleDeleteReply(comment.commentId, comment._id) : handleDeleteComment(comment._id)}
                sx={{
                  color: "var(--text-primary)",
                  backgroundColor: "none",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "var(--gold)",
                  },
                }}
              >
                <DeleteIcon />
              </Button>
            )}
            </div>
          </div>
          <div className={`${isReply ? "reply" : "comment"}-content`}>
            {comment.text}
          </div>
          <div className={`${isReply ? "reply" : "comment"}-footer`}>
            <LikeButton
              liked={isLiked}
              likes={comment.likes}
              onClick={() =>
                isReply
                  ? handleLikeReply(comment.commentId, comment._id)
                  : handleLikeComment(comment._id)
              }
            />
            {!isReply && (
              <Button
                className="reply-button"
                variant="plain"
                color="neutral"
                onClick={() => handleReply(comment._id, username)}
                sx={{
                  color: "var(--text-primary)",
                  backgroundColor: "none",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "var(--gold)",
                  },
                }}
              >
                Reply
              </Button>
            )}
          </div>
          {!isReply &&
            Array.isArray(comment.replies) &&
            comment.replies.length > 0 && (
              <>
                <Button
                  className="view-replies-button"
                  variant="plain"
                  color="neutral"
                  onClick={() => toggleReplies(comment._id)}
                  sx={{
                    color: "var(--text-primary)",
                    backgroundColor: "none",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "var(--gold)",
                    },
                  }}
                >
                  {showReplies[comment._id] ? "Hide Replies" : "View Replies"} (
                  {comment.replies.length})
                </Button>
                {showReplies[comment._id] && (
                  <div className="replies-list">
                    {comment.replies.map((reply) =>
                      renderComment({ ...reply, commentId: comment._id }, true)
                    )}
                  </div>
                )}
              </>
            )}
        </div>
      );
    },
    [
      handleLikeComment,
      handleLikeReply,
      handleReply,
      showReplies,
      toggleReplies,
      handleDeleteComment,
      handleDeleteReply,
    ]
  );

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="plain"
        aria-labelledby="modal-dialog-overflow"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
        sx={{
          backgroundColor: "var(--black)",
          color: "var(--text-primary)",
          width: "40rem",
        }}
      >
        <ModalClose />
        <DialogTitle>
          <Stack spacing={2}>
            <Stack spacing={1} direction={"row"}>
              <input
                type="text"
                ref={inputRef}
                className="comment-input"
                placeholder={placeholder}
              />
              <Fab
                size="small"
                color="primary"
                aria-label="add"
                onClick={postComment}
              >
                <SendIcon />
              </Fab>
            </Stack>
            <div className="comments-title">Comments:</div>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "var(--black)",
            color: "var(--text-primary)",
          }}
        >
          {loading ? (
            <div className="loading-spinner">
              <CircularProgress color="inherit" />
            </div>
          ) : (
            <div className="comments-list">
              {Array.isArray(comments) &&
                comments.map((comment) => (
                  <React.Fragment key={comment._id}>
                    {renderComment(comment, false)}
                  </React.Fragment>
                ))}
            </div>
          )}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}

export default Comments;

