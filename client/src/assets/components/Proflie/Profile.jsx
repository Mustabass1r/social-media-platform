import React, { useState, useEffect, useRef } from "react";
import { Image } from "@mantine/core";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import Compressor from "compressorjs";
import axios from "axios";
import "./Profile.css";
import MyPosts from "./MyPosts";
import LikedPosts from "./LikedPosts.jsx";
import CommentedPosts from "./CommentedPosts";
import MyCommunities from "./MyCommunities.jsx";
import { AccountCircleOutlined } from "@mui/icons-material";

const Profile = () => {
  const [value, setValue] = useState(0);
  const [userInfo, setUserInfo] = useState({
    username: "",
    totalCommunitiesJoined: 0,
    profilePicture: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchTotalUserCommunitiesJoined = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/communities/totalUserCommunitiesJoined",
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
          },
        }
      );
      return response.data.totalCommunitiesJoined;
    } catch (error) {
      console.error("Error fetching communities:", error);
      return 0;
    }
  };

  useEffect(() => {
    const username = JSON.parse(localStorage.getItem("user")).username;
    const profilePicture = JSON.parse(
      localStorage.getItem("user")
    ).profilePhoto;

    const getUserInfo = async () => {
      const totalCommunities = await fetchTotalUserCommunitiesJoined();
      setUserInfo({
        username,
        totalCommunitiesJoined: totalCommunities,
        profilePicture,
      });
    };

    getUserInfo();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOverlayClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);

    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1000,
      maxHeight: 1000,
      success: async (compressedFile) => {
        const formData = new FormData();
        formData.append("profilePhoto", compressedFile);
        formData.append("userId", JSON.parse(localStorage.getItem("user")).id);

        try {
          const response = await axios.patch(
            "http://localhost:3000/users/changeProfilePhoto",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },

            }
          );

          setUserInfo((prev) => ({
            ...prev,
            profilePicture: response.data.profilePhoto, // Assuming API returns the updated URL
          }));

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...JSON.parse(localStorage.getItem("user")),
              profilePhoto: response.data.profilePhoto,
            })
          );

          console.log("Profile photo updated successfully:", response.data);
        } catch (error) {
          console.error("Error updating profile photo:", error);
        } finally {
          setIsLoading(false);
          window.location.reload();
        }
      },
      error: (err) => {
        console.error("Compression failed:", err);
        setIsLoading(false);
      },
    });
  };

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
    <>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-picture-container">
          <div className="profile-picture-container" style={{alignContent: "center"}}>
            {JSON.parse(localStorage.getItem("user")).profilePhoto?<Image
              src={userInfo.profilePicture}
              alt="Profile"
              width={80}
              height={80}
              style={{ objectFit: "cover", borderRadius: "1rem" }}
            />:
            //<AccountCircleOutlined sx={{width: "auto", height: "auto"}}/>
            <div style={{width: "auto", height: "auto", alignContent: "center" , marginLeft: "1.5rem" }}>Upload Image</div>
            }
            <div className="profile-overlay" onClick={handleOverlayClick}>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AddAPhotoOutlinedIcon />
              )}
            </div>
            <input
              type="file"
              hidden
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoChange}
            />
          </div>
        </div>
        <div className="profile-name">
          <h1>{userInfo.username}</h1>
          <h4>Total Communities: {userInfo.totalCommunitiesJoined}</h4>
        </div>
      </div>

      {/* Tabs Section */}
      <Box
        sx={{
          width: "70%",
          bgcolor: "var(--component-bg)",
          borderRadius: "1rem",
          marginTop: "1rem",
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
          <Tab label="My Posts" sx={tabStyles} />
          <Tab label="Liked Posts" sx={tabStyles} />
          <Tab label="Commented Posts" sx={tabStyles} />
          <Tab label="My Communities" sx={tabStyles} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <div className="tab-content">
        {value === 0 && <MyPosts />}
        {value === 1 && <LikedPosts />}
        {value === 2 && <CommentedPosts />}
        {value === 3 && <MyCommunities />}
      </div>
    </>
  );
};

export default Profile;
