import React, { useState, useEffect } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import "./Topbar.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const arrowStyle = {
    width: "20px",
    height: "20px",
    color: "var(--white)",
    marginLeft: "0.5rem",
    cursor: "pointer",
  };

  // Check authentication on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/"); // Redirect to login page if not authenticated
    }
  }, [navigate]);

  function handleDropdownClick() {
    setDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  }

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/"); // Redirect to login page
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="profile">
      {user?.profilePhoto ? (
        <img
          className="pfp"
          style={{
            width: "40px",
            height: "40px",
            color: "var(--white)",
            borderRadius: "50%",
          }}
          src={user.profilePhoto}
          alt="Profile"
        />
      ) : (
        <AccountCircleIcon style={{ fontSize: "40px", color: "var(--white)" }} />
      )}
      <h3 className="profile-name">{user?.username}</h3>
      {isDropdownOpen ? (
        <KeyboardArrowUpIcon
          className="dropdown"
          style={arrowStyle}
          onClick={handleDropdownClick}
        />
      ) : (
        <KeyboardArrowDownIcon
          className="dropdown"
          style={arrowStyle}
          onClick={handleDropdownClick}
        />
      )}

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="dropdown-menu">
          <ul>
            <li onClick={handleProfile}>Edit Profile</li>
            <li onClick={handleSignOut}>Sign Out</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Profile;
