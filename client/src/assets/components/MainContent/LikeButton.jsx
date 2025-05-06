import React from "react";
import Button from "@mui/joy/Button";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import GradeIcon from "@mui/icons-material/Grade";

function LikeButton({ liked, likes, onClick }) {
  return (
    <Button
      className="like-button"
      variant="plain"
      color="neutral"
      sx={{
        color: "var(--text-primary)",
        backgroundColor: "none",
        "&:hover": {
          backgroundColor: "transparent",
          color: "var(--gold)", // Change background color on hover
        },
      }}
      onClick={onClick}
    >
      {liked ? <GradeIcon style={{ color: "gold" }} /> : <GradeOutlinedIcon />}
      {likes} {likes === 1 ? "Like" : "Likes"}
    </Button>
  );
}

export default LikeButton;
