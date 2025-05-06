import { PhpSharp } from '@mui/icons-material';
import React, { createContext, useContext, useState, useCallback } from 'react';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const deletePost = useCallback((postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  }, []);

  const value = {
    posts,
    setPosts,
    deletePost,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

