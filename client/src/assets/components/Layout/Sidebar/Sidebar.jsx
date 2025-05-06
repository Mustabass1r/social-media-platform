import React from 'react';
import { useNavigate } from "react-router-dom";
import SidebarItem from './SidebarItem';
import HomeIcon from '@mui/icons-material/Home'; 
import ProfileIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import "./Sidebar.css";
import { Divider } from '@mui/material';
import SidebarCommunities from './sidebar_communities/SidebarCommunities';



const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <h1 className="font-bold universe-title">
        <span className="uni">Uni</span>
        <span className="rest">verse</span>
      </h1>
      <SidebarItem 
        label="Home" 
        onClick={() => navigate("/home")} 
        icon={<HomeIcon />} 
      />
      <SidebarItem 
        label="Profile" 
        onClick={ () => navigate("/profile")} 
        icon={<ProfileIcon />} 
      />
      <SidebarItem 
        label="Explore Communities" 
        onClick={() => {  navigate("/explore") }} 
        icon={<GroupsOutlinedIcon />} 
      />
      <SidebarItem 
        label="Settings" 
        onClick={() => { navigate("/settings") }} 
        icon={<SettingsIcon />} 
      />

      <Divider className="sidebar-divider" style={{ margin: '0.6rem 0' }} />
      
      <SidebarCommunities />

    </div>
  );
};

export default Sidebar;
