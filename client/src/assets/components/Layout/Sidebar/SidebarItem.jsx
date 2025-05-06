import React from "react";
import './Sidebar.css';

const SidebarItem = ({ label, onClick, icon }) => {
  return (
    <div className="sidebar-item font-semibold" onClick={onClick}>
      <span className="icon">{icon}</span>
      <span className="label">{label}</span>
    </div>
  );
};

export default SidebarItem;
