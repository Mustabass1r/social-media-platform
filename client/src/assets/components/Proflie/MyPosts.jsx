import React, { useState, useEffect, useCallback } from "react";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import Post from "../MainContent/Post"; // Reuse Post component for displaying individual posts
import "./Profile.css";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);


  const fetchMyPosts = useCallback(async (pageNum) => {
    if (!hasMore && pageNum > 1) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:3000/posts/myPosts", {
        params: { userId: JSON.parse(localStorage.getItem("user")).id, page: pageNum, limit: 20 },
      });

      console.log("My Posts API Response:", response.data);

      if (response.data && Array.isArray(response.data.posts)) {
        const { posts: newPosts, pagination } = response.data;

        setPosts((prevPosts) => {
          const updatedPosts = pageNum === 1 ? newPosts : [...prevPosts, ...newPosts];
          return updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        setTotalPages(pagination.totalPages);
        setHasMore(pageNum < pagination.totalPages);
      } else {
        console.error("Invalid response structure", response.data);
        setError("Invalid response from server");
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.response?.data?.message || "An error occurred while fetching posts");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [hasMore]);

  // Fetch posts on component mount and when `page` changes
  useEffect(() => {
    fetchMyPosts(page);
  }, [page, fetchMyPosts]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (!loading && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="my-posts posts-container">
      {loading && posts.length === 0 ? (
        <div className="loading-container">
          <CircularProgress />
        </div>
      ) : posts.length > 0 ? (
        posts.map((post, index) => (
          <Post key={`${post._id}-${index}`} post={post} />
        ))
      ) : (
        <p>No posts available.</p>
      )}
      {loading && posts.length > 0 && (
        <div className="loading-container">
          <CircularProgress />
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="loading-text">No more posts to load.</p>
      )}
    </div>
  );
};

export default MyPosts;
