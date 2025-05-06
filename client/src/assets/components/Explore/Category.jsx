import React from "react";
import CategoryCommunity from "./CategoryCommunity";
import "./Category.css";

function Category({ category, communities }) {
  return (
    <div className="category">
      <h2>More in {category}</h2>
      <div className="category-communties">
        {communities.map((community) => (
           <CategoryCommunity
           key={community._id}
           communityId={community._id}
           communityName={community.communityName}
           totalMembers={community.memberCount}
           profileIcon={community.communityPhoto}
           description={community.description}
         />
        ))}
      </div>
    </div>
  );
}

export default Category;
