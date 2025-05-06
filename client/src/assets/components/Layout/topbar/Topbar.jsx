import React, { useState, useEffect } from "react";
import "./topbar.css";
import Profile from "./Profile.jsx";
import { Autocomplete } from "@mantine/core";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

function Topbar() {
  const [searchValue, setSearchValue] = useState("");
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      if (searchValue.trim() === "") {
        return;
      }
      console.log("Search value:", searchValue);
      const encodedSearchValue = encodeURIComponent(searchValue.trim());
      navigate(`/search/${encodedSearchValue}`);
    }
  };

  const fetchSearchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/posts/search`, {
        params: { searchValue },
      });
      console.log(response.data);
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/users/userNotifications",
        {
          params: {
            userId: JSON.parse(localStorage.getItem("user")).id,
          },
        }
      );
      setNotifications(
        response.data.notifications.filter((notification) => !notification.seen)
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  return (
    <div className="topbar">
      <div className="search-bar">
        <Autocomplete
          value={searchValue}
          onChange={setSearchValue}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          data={[
            { group: "Frontend", items: ["React", "Angular"] },
            { group: "Backend", items: ["Express", "Django"] },
          ]}
          limit="5"
        />
      </div>
      <div className="topbar-right">
        <IconButton
          aria-describedby={id}
          onClick={handleNotificationClick}
          color="inherit"
        >
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          disableScrollLock={true} 
          overflowY="auto"
        >
          <List
            sx={{
              width: "20rem",
              maxWidth: "390px",
              bgcolor: "var(--black)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              padding: "1rem", 
            }}
          >
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  sx={{
                    bgcolor: "var(--component-bg)",
                    borderRadius: "0.5rem", 
                  }}
                >
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: "inline" }}
                          component="span"
                          variant="body2"
                          color="var(--white)"
                        >
                          {notification.message}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem sx={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
                <ListItemText primary="No new notifications" />
              </ListItem>
            )}
          </List>
        </Popover>
        <Profile />
      </div>
    </div>
  );
}

export default Topbar;
