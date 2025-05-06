import React from "react";
import { Image } from "@mantine/core";
import "./CategoryCommunity.css";
import { useNavigate } from "react-router-dom";

function CategoryCommunity({
  communityId,
  communityName,
  totalMembers,
  profileIcon,
  description,
}) {

  const navigate = useNavigate();

  return (
    <div
      className="category-community"
      onClick={() => {
        console.log("Community ID:", communityId + " Community Name:", communityName + " Total Members:", totalMembers + " Profile Icon:", profileIcon);
        navigate(`/community/${communityId}`, {
          state: { communityName, totalMembers, profileIcon },
        });
      }}
    >
      <div className="community-image">
        <Image
          alt="Profile"
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: "50%" }}
          src={profileIcon}
        />
        <div className="community-info">
          <span>{communityName}</span>
          <span>Total Members: {totalMembers}</span>
        </div>
      </div>
      <div className="description">{description}</div>
    </div>
  );
}

export default CategoryCommunity;
