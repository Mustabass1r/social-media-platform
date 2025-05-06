import React, { useState } from "react";
import "./Rightbar.css";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"; // Import an icon
import SidebarCommunity from "../Sidebar/sidebar_communities/SidebarCommunity.jsx";
import { useEffect } from "react";
import axios from "axios";

function Rightbar() {
  const [showAll, setShowAll] = useState(false);

  const [communities, setCommunities] = useState([]); // State to store communities
  const communitiesToShow = showAll ? communities : communities.slice(0, 5);

  // Fetch communities on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/communities/explore",
          {
            params: {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
          }
        );
        console.log(response.data);

        const topCommunities = [];

        response.data.forEach((category) => {
          // Sort communities in descending order of memberCount and take top 3
          const sortedCommunities = category.communities
            .sort((a, b) => b.memberCount - a.memberCount)
            .slice(0, 3);

          // Push the sorted communities (without category) to the topCommunities array
          topCommunities.push(...sortedCommunities);
        });

        topCommunities.sort((a, b) => b.memberCount - a.memberCount);

        setCommunities(topCommunities);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <div className="right-sidebar">
      <div>Based on your communities</div>
      <div className="sug-sidebar-communities">
        <div className="sug-communities-list">
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
            className="see-all-button sug-see-all-btn font-medium"
          >
            {showAll ? "See Less" : "See All"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Rightbar;
