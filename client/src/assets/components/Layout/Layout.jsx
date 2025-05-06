import React from 'react';
import Sidebar from './Sidebar/Sidebar.jsx';
import "./Layout.css";
import Topbar from './topbar/topbar.jsx';
import Rightbar from './Rightbar/Rightbar.jsx';
const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Topbar />
      <Sidebar />
      <div className="content">
        <main>
          {children}
        </main>
      </div>
      <Rightbar />
    </div>
  );
};

export default Layout;