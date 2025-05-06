import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useParams } from "react-router-dom";
import axios from 'axios';
import Post from '../MainContent/Post';
import '../MainContent/Post.css';
import CategoryCommunity from '../Explore/CategoryCommunity';

function Search() {
  const [value, setValue] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useParams();
  const decodedSearchValue = decodeURIComponent(searchTerm);
  console.log(decodedSearchValue);
  const [communities, setCommunities] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchSearchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/posts/search`, {
          params: { searchValue:decodedSearchValue },
        });
        // Access the posts array from the response data
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

     const fetchSearchCommunities = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:3000/communities/search`,
            {
              params: { searchValue : decodedSearchValue },
            }
          );
          console.log(response.data);
          setCommunities(response.data || []);
          console.log(communities);
        } catch (error) {
          console.error(error);
          setCommunities([]);
        }
        finally {
          setLoading(false);
        }
      };

    if (decodedSearchValue) {
      fetchSearchPosts();
      fetchSearchCommunities();
    }
  }, [decodedSearchValue]);

  const tabStyles = {
    fontWeight: 600,
    color: "var(--text-primary)",
    "&:hover": {
      color: "var(--gold)",
    },
    "&.Mui-selected": {
      color: "var(--gold)",
    },
  };

  return (
    <div>
      <div style={{ marginRight: "10rem" }}>
        <Box
          sx={{
            width: "70%",
            bgcolor: "var(--component-bg)",
            borderRadius: "1rem",
            marginTop: "5rem",
            marginLeft: "6.8rem",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            centered
            TabIndicatorProps={{
              sx: {
                backgroundColor: "var(--gold)",
                color: "var(--gold)",
              },
            }}
          >
            <Tab label="Posts" sx={tabStyles} />
            <Tab label="Community" sx={tabStyles} />
          </Tabs>
        </Box>
      </div>

      <div className="tab-content" style={{width: "45rem", marginRight: "5rem" , marginTop: "1rem"}}>
        {value === 0 && (
          <>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : posts.length > 0 ? (
              posts.map((post) => <Post key={post._id} post={post} />)
            ) : (
              <div className="no-results">No posts found for "{decodedSearchValue}"</div>
            )}
          </>
        )}
        {value === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : communities.length > 0 ? (
              communities.map((community) => (
                <CategoryCommunity
                  key={community._id}
                  communityId={community._id}
                  communityName={community.communityName}
                  totalMembers={community.memberCount}
                  profileIcon={community.communityPhoto}
                  description={community.description}
                />
              ))
            ) : (
              <div className="no-results">No communities found for "{decodedSearchValue}"</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;