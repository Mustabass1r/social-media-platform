import React, { useState, useEffect, useCallback } from "react";
import { Image } from "@mantine/core";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { Modal, Box, CircularProgress } from "@mui/material";
import "../MainContent/MainContent.css";
import CreatePost from "./CreatePost";
import "./Community.css";
import "../Proflie/Profile.css";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Post from "../MainContent/Post";
import { Button } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ManageUsersModal from "./ManageUserModal";

function Community() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [communityInfo, setCommunityInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [users, setUsers] = useState([]); // State for users in the community
  const [isManageUsersModalOpen, setIsManageUsersModalOpen] = useState(false); // State for manage users modal

  const { communityId } = useParams();
  const location = useLocation();
  const { communityName, totalMembers, profileIcon } = location.state || {};

  const fetchPosts = useCallback(
    async (pageNum) => {
      if (!hasMore && pageNum > 1) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:3000/communities/communityInfo/${communityId}`,
          {
            params: { page: pageNum, limit: 20 },
          }
        );

        console.log("API Response:", response.data);

        if (
          response.data &&
          response.data.community &&
          Array.isArray(response.data.posts)
        ) {
          const { community, posts: newPosts, pagination } = response.data;

          setCommunityInfo(community);
          setPosts((prevPosts) => {
            const updatedPosts =
              pageNum === 1 ? newPosts : [...prevPosts, ...newPosts];
            return updatedPosts
              .map((post) => ({
                ...post,
                userId: {
                  ...post.userId,
                  username: post.userId?.username || "Anonymous",
                  profilePhoto:
                    post.userId?.profilePhoto || "/default-avatar.png",
                },
              }))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          });
          setTotalPages(pagination.totalPages);
          setHasMore(pageNum < pagination.totalPages);

          const currentUserId = JSON.parse(localStorage.getItem("user")).id;
          setIsUserJoined(community.users.some(user => user._id === currentUserId));

          setUsers(response.data.community.users);

          checkIfUserIsOwner();
        } else {
          console.error("Invalid response structure", response.data);
          setError("Invalid response from server");
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(
          error.response?.data?.message ||
            "An error occurred while fetching posts"
        );
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [communityId ]
  );

  const checkIfUserIsOwner = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/communities/checkIfUserIsOwner`,
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
            communityId: communityId,
          },
        }
      );
      if (response.data.isOwner) {
        setIsUserOwner(true);

        console.log("User is owner");
      }
    } catch (error) {
      console.error("Error checking user ownership:", error);
    }
  }, [communityId]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1);
  }, [communityId, fetchPosts]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  useEffect(() => {
    setIsUserOwner(false);
    setIsUserJoined(false);
    setUsers([]);
  }, [communityId]);

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenManageUsersModal = () => setIsManageUsersModalOpen(true); // Open Manage Users Modal
  const handleCloseManageUsersModal = () => setIsManageUsersModalOpen(false); // Close Manage Users Modal

  const handleNewPost = (newPost) => {
    setPosts((prevPosts) => {
      const updatedPosts = [newPost, ...prevPosts];
      return updatedPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    });
    handleCloseModal();
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const updateUsersList = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    setCommunityInfo((prevCommunityInfo) => ({
      ...prevCommunityInfo,
      memberCount: prevCommunityInfo.memberCount - 1,
    }))
  };


  const handleLeaveCommunity = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/communities/leaveCommunity`,
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
            communityId: communityId,
          },
        }
      );
      if (response.status === 200) {
        setIsUserJoined(false);
        setCommunityInfo(prevInfo => ({
          ...prevInfo,
          users: prevInfo.users.filter(user => user._id !== JSON.parse(localStorage.getItem("user")).id),
          memberCount: prevInfo.memberCount - 1
        }));
      }
    } catch (error) {
      console.error("Error leaving community:", error);
    }
    finally{
      window.location.reload();
    }
  };

  const handleJoinCommunity = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/communities/joinCommunity`,
        null,
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
            communityId: communityId,
          }
        }
      );
      if (response.status === 200) {
        setIsUserJoined(true);
        setCommunityInfo(prevInfo => ({
          ...prevInfo,
          users: [...prevInfo.users, JSON.parse(localStorage.getItem("user"))],
          memberCount: prevInfo.memberCount + 1
        }));
      }
    } catch (error) {
      console.error("Error joining community:", error);
    }
    finally{
      window.location.reload();
    }
  };

  return (
    <>
      {/* Community Header */}
      <div className="profile-header">
        <div className="profile-picture-container">
          <Image
            src={communityInfo?.profileIcon || profileIcon}
            alt="Profile"
            width={80}
            height={80}
            style={{ objectFit: "cover", borderRadius: "1rem" }}
          />
        </div>
        <div className="profile-name">
          <h1>{communityInfo?.name || communityName}</h1>
          <h4>Total Members: {communityInfo?.memberCount || totalMembers}</h4>
        </div>

        {!isUserOwner ? (
          <Button
            className="join-button"
            variant="outlined"
            style={{
              color: "var(--black)",
              backgroundColor: "var(--gold)",
              border: "1px solid var(--black)",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              alignSelf: "auto",
              fontFamily: "Poppins",
            }}
            onClick={isUserJoined ? handleLeaveCommunity : handleJoinCommunity}
          >
            {isUserJoined ? "Leave" : "Join"}
          </Button>

        ) : (
          <Button
            onClick={handleOpenManageUsersModal}
            startIcon={<GroupIcon />}
            style={{
              color: "var(--black)",
              backgroundColor: "var(--gold)",
              border: "1px solid var(--black)",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              marginLeft: "1rem",
              fontFamily: "Poppins",
            }}
          >
            Manage Users
          </Button>
        )}
      </div>

      {/* Posts Section */}
      <div className="community-page">
        <main className="main-content">
          <div className="main-container">
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
        </main>
      </div>

      {/* Add Post Button */}
      <div className="add-post-btn">
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            backgroundColor: "var(--gold)",
            color: "var(--black)",
            borderRadius: "1rem",
            padding: "0.5rem",
            "&:hover": { backgroundColor: "var(--white)" },
          }}
          onClick={handleOpenModal}
        >
          <AddIcon />
        </Fab>
      </div>

      {/* Modal for Creating a Post */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="create-post-modal"
        aria-describedby="modal-to-create-new-post"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: 500,
            bgcolor: "var(--component-bg)",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <CreatePost
            onClose={handleCloseModal}
            communityId={communityId}
            onNewPost={handleNewPost}
          />
        </Box>
      </Modal>

      {/* Manage Users Modal */}
      <ManageUsersModal
        open={isManageUsersModalOpen}
        onClose={handleCloseManageUsersModal}
        users={users.filter(
          (user) => user._id !== JSON.parse(localStorage.getItem("user")).id
        )} // Execute the filter function before passing
        communityId={communityId}
        updateUsersList={updateUsersList}
      />
    </>
  );
}

export default Community;

