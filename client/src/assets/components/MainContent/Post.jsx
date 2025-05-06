import React, { useState, useCallback, useEffect, forwardRef } from "react";
import axios from "axios";
import "./Post.css";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import GradeIcon from "@mui/icons-material/Grade";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import Comments from "./Comments";
import Button from "@mui/joy/Button";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Post = forwardRef(({ post, onVisible }, ref) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [liked, setLiked] = useState(
    post.likedBy.includes(JSON.parse(localStorage.getItem("user")).id)
  );
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  const timestamp = post.uploadTime;
  const date = new Date(timestamp);
  const options = { day: "2-digit", month: "long", year: "numeric" };
  const formattedDate = date
    .toLocaleDateString("en-US", options)
    .replace(",", "");
    

  const observer = React.useRef();
  const postRef = React.useRef();

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isCurrentUserPost = post.userId._id === currentUser.id;

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        onVisible();
        observer.current.unobserve(postRef.current);
      }
    },
    [onVisible]
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    observer.current = new IntersectionObserver(handleIntersection, options);

    if (postRef.current) {
      observer.current.observe(postRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleIntersection]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/userPost/getComments",
        { postId: post._id }
      );
      setComments(response.data.comments);
      setLoading(false);
      console.log(post);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
    }
  }, [post._id]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]);

  const handleLike = async () => {
    const userId = JSON.parse(localStorage.getItem("user")).id;

    console.log("Post ID:", post._id + " User ID:", userId);
    if (liked) {
      try {
        const response = await axios.delete(
          "http://localhost:3000/userPost/deletePostLike",
          {
            params: {
              postId: post._id,
              userId: userId,
            },
          }
        );

        if (response.status === 200) {
          setLiked(false);
          setLikes((prevLikes) => prevLikes - 1);
          post.likedBy = post.likedBy.filter((id) => id !== userId);
        }
      } catch (error) {
        console.error("Error deleting like:", error);
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:3000/userPost/addPostLike",
          {
            postId: post._id,
            userId: userId,
          }
        );

        if (response.status === 200) {
          setLiked(true);
          setLikes((prevLikes) => prevLikes + 1);
          post.likedBy.push(userId);
        }
      } catch (error) {
        console.error("Error adding like:", error);
      }
    }
  };

  const handleCommentClick = () => {
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/posts/deletePost`,
        {
          params: {
            postId: post._id,
            userId: currentUser.id,
          },
        }
      );

      if (response.status === 200) {
        setIsDeleted(true);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
    setConfirmDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div
      className="post-card"
      ref={(node) => {
        postRef.current = node;
        if (ref) ref(node);
      }}
    >
      <div className="post-header">
        <div className="post-avatar">
          <img
            src={post.userId.profilePhoto}
            alt={post.community}
            className="avatar-img"
          />
        </div>
        <div className="post-user-info">
          <div className="post-community">{post.communityId.communityName}</div>
          <div className="post-username">{post.userId.username}</div>
          <div className="post-date">{formattedDate}</div>
        </div>
        {isCurrentUserPost && (
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? "long-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
            sx={{ marginLeft: "auto", color: "var(--white)" }}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </div>
      <p className="post-content">{post.description}</p>
      {post.media && (
        <img src={post.media} alt={post.title} className="post-image" />
      )}
      <div className="post-footer">
        <Button
          className="like-button"
          variant="plain"
          color="neutral"
          onClick={handleLike}
          sx={{
            color: "var(--text-primary)",
            backgroundColor: "none",
            "&:hover": {
              backgroundColor: "transparent",
              color: "var(--gold)",
            },
          }}
          size="medium"
        >
          {liked ? (
            <GradeIcon style={{ color: "gold" }} />
          ) : (
            <GradeOutlinedIcon />
          )}
          {likes} {likes === 1 ? "Like" : "Likes"}
        </Button>

        <Button
          className="comment-button"
          variant="plain"
          color="neutral"
          onClick={handleCommentClick}
          sx={{
            color: "var(--text-primary)",
            backgroundColor: "none",
            "&:hover": {
              backgroundColor: "transparent",
              color: "var(--gold)",
            },
          }}
          size="medium"
        >
          <ModeCommentOutlinedIcon />
          {post.comments.length}{" "}
          {post.comments.length === 1 ? "Comment" : "Comments"}
        </Button>
      </div>
      {showComments && (
        <Comments
          comments={comments}
          setComments={setComments}
          loading={loading}
          open={showComments}
          onClose={handleCloseComments}
          postId={post._id}
        />
      )}
      {isCurrentUserPost && (
        <>
          <Menu
            id="long-menu"
            MenuListProps={{
              "aria-labelledby": "long-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            disableScrollLock={true}
            sx={{
              overflowY: "auto",
            }}
          >
            <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
          </Menu>
          <Dialog
            open={confirmDialogOpen}
            onClose={handleCancelDelete}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirm Delete"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="primary" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
});

export default Post;
