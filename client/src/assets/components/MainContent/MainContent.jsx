import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MainContent.css";
import Post from "./Post.jsx";
import axios from "axios";

function MainContent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const seenPosts = useRef(new Set());

  const fetchPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    console.log(JSON.parse(localStorage.getItem("user")).id);
    try {
      const response = await axios.post(
        `http://localhost:3000/userPost/getPostsForHome`,
        {
          userId: JSON.parse(localStorage.getItem("user")).id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const newPosts = response.data.posts || [];

      if (newPosts.length === 0) {
        setHasMore(false);
      }

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (!loading && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const addSeenPost = useCallback(async (postId) => {
    if (seenPosts.current.has(postId)) return;

    try {
      await axios.post(
        "http://localhost:3000/userPost/seenas",
        {
          userId: JSON.parse(localStorage.getItem("user")).id,
          postId: postId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      seenPosts.current.add(postId);
    } catch (error) {
      console.error("Error marking post as seen:", error);
    }
  }, []);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <main className="main-content">
      <div className="main-container">
        {posts.map((post, index) => (
          <Post
            key={`${post._id}-${index}`}
            post={post}
            ref={index === posts.length - 1 ? lastPostElementRef : null}
            onVisible={() => addSeenPost(post._id)}
          />
        ))}
        {loading && <p className="loading-text">Loading more posts...</p>}
        {!hasMore && <p className="loading-text">No more posts to load.</p>}
      </div>
    </main>
  );
}

export default MainContent;

