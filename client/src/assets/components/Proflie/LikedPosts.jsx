import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "../MainContent/Post";

const LikePosts = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLikedPosts = async (pageNum) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:3000/posts/myLikedPosts",
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
            page: pageNum,
            limit: 20,
          },
        }
      );

      const { posts: newLikedPosts, pagination } = response.data;

      setLikedPosts((prevPosts) =>
        pageNum === 1 ? newLikedPosts : [...prevPosts, ...newLikedPosts]
      );
      setTotalPages(pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch liked posts");
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedPosts(page);
  }, [page]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      !loading &&
      page < totalPages
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, totalPages]);

  return (
    <div className="liked-posts posts-container">
      {error && <p className="error-message">{error}</p>}
      {likedPosts.map((post, index) => (
        <Post key={`${post._id}-${index}`} post={post} />
      ))}
      {loading && <p>Loading...</p>}
      {!loading && page >= totalPages && <p>No more posts to load.</p>}
    </div>
  );
};

export default LikePosts;
