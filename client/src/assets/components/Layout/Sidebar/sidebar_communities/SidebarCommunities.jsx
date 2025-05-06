import React, { useState, useEffect } from "react";
import "./SidebarCommunities.css";
import SidebarCommunity from "./SidebarCommunity"; // Import the SidebarCommunity component
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"; // Import an icon
import axios from "axios";

function SidebarCommunities() {
  const [communities, setCommunities] = useState([]); // State to store communities
  const [showAll, setShowAll] = useState(false); // State to track whether to show all communities

  // Fetch communities on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/communities/joinedCommunities",
          {
            params: {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
          }
        );
        setCommunities(response.data || []);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  // Determine communities to show (top 4 or all)
  const communitiesToShow = showAll ? communities : communities.slice(0, 4);

  return (
    <div className="sidebar-communities">
      <h3 className="my-communities-title font-semibold">
        My Communities{" "}
        <span className="my-communities-count">{communities.length}</span>
      </h3>
      <div className="communities-list">
        {communitiesToShow.map((community) => (
          <SidebarCommunity
            key={community._id}
            communityName={community.communityName} // Match field names from API response
            totalMembers={community.memberCount}
            profileIcon={community.communityPhoto}
            communityId={community._id}
          />
        ))}
      </div>
      {communities.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="see-all-button font-medium"
        >
          {showAll ? "See Less" : "See All"}
        </button>
      )}
    </div>
  );
}

export default SidebarCommunities;
