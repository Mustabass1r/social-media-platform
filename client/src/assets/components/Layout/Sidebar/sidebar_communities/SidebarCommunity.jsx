import React from "react";
import "./SidebarCommunities.css";
import { useNavigate } from "react-router-dom";

function SidebarCommunity({
  communityName,
  totalMembers,
  profileIcon,
  communityId,
}) {
  const navigate = useNavigate();

  return (
    <div
      className="sidebar-community"
      onClick={() => {
        navigate(`/community/${communityId}`, {
          state: { communityName, totalMembers, profileIcon },
        });
      }}
    >
      <div className="profile-picture">
        <img 
          src={profileIcon || "/default-community-icon.png"} 
          alt={communityName} 
          style={{ borderRadius: "50%" }} 
        />
      </div>

      <div className="community-info font-medium">
        <div className="community-name">{communityName || "Unnamed Community"}</div>

        <div className="total-members font-light">
          <span>{totalMembers || 0}</span>
          <span>Members</span>
        </div>
      </div>
    </div>
  );
}

export default SidebarCommunity;

