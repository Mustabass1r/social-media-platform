import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import CategoryCommunity from "../Explore/CategoryCommunity";
import "./Profile.css";

function MyCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state


  const fetchMyCommunities = async () => {
    try {
      setLoading(true); // Start loading before fetching
      const response = await axios.get(
        "http://localhost:3000/communities/myCommunities",
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
          },
        }
      );
      setCommunities(response.data || []);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false); // Stop loading once fetching is complete
    }
  };

  useEffect(() => {
    fetchMyCommunities();
  }, []);

  return (
    <div className="my-communities-container" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem", width: "53rem", marginLeft: "0rem" }}>
      {loading ? (
        <div className="loading-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100px" }}>
          <CircularProgress />
        </div>
      ) : Array.isArray(communities) && communities.length === 0 ? (
        <p>You have no owned communities</p>
      ) : (
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
      )}
    </div>
  );
}

export default MyCommunities;
