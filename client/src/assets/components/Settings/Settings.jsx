import React, { useState, useEffect, useRef } from "react";
import "./Settings.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import axios from "axios";

function Settings() {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const [isEditable, setIsEditable] = useState(false);
  const [email, setEmail] = useState(""); 
  const [username, setUsername] = useState(JSON.parse(localStorage.getItem("user")).username);
  const usernameInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState(""); 

  const [passwordError, setPasswordError] = useState(""); 
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/users/getUserEmail`,
          {
            params: {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
          }
        );

        if (response.data.email) {
          setEmail(response.data.email);
        } else {
          setEmail("");
        }
      } catch (error) {
        console.error("Error fetching email:", error);
        setEmail("");
      }
    };

    fetchEmail();
  }, []);

  const handleEditClick = () => {
    setIsEditable(true);
    setTimeout(() => {
      usernameInputRef.current.focus();
    }, 0);
  };

  const handleSaveClick = async () => {
    if (!usernameRegex.test(username)) {
      setUsernameError(
        "Username must be 3-20 characters long and contain only letters, numbers, or underscores."
      );
      return;
    }
    setUsernameError("");

    setIsEditable(false);
    try {
      const response = await axios.patch(
        `http://localhost:3000/users/changeUsername`,
        {
          newUsername: username,
          userId: JSON.parse(localStorage.getItem("user")).id,
        }
      );

      if (response.status === 200) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user")),
            username: username,
          })
        );
        setUsername(username);
      }
    } catch (error) {
      console.error("Error changing username:", error);
    } finally {
      window.location.reload();
    }
  };

  const handleChangePasswordClick = () => {
    handleOpen();
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handlePasswordSubmit = () => {
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters long, contain one letter, one number, and one special character."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match!");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password cannot be the same as the current password!");
      return;
    }
    let response
    const userId = JSON.parse(localStorage.getItem("user")).id;
    try{
     response = axios.patch(
      `http://localhost:3000/users/changePassword`,
      {
        userId,
        oldPassword: currentPassword,
        newPassword,
      }
    )
  }
  catch(error){
    console.error("Error changing password:", error);
    if(response.status === 401){
      setPasswordError("Current password is incorrect!");
      return;
    }
  }

    setPasswordError("");
    handleClose();
  };

  const textFieldStyle = {
    width: "20rem",
    "& .MuiInput-underline:before": {
      borderBottomColor: "white",
    },
    "& .MuiInput-underline:hover:before": {
      borderBottomColor: "var(--gold)",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "var(--gold)",
    },
    "& .MuiInputBase-input": {
      color: "white",
    },
    "& .MuiInputLabel-root": {
      color: "white",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--gold)",
    },
    borderColor: "var(--white)",
    borderRadius: "10px",
    color: "var(--white)",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--white)",
      },
      "&:hover fieldset": {
        borderColor: "var(--gold)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--gold)",
      },
    },
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "var(--component-bg)",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "10px",
  };

  return (
    <div
      className="settings"
      style={{
        marginTop: "6rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: "1rem",
        marginLeft: "25rem",
      }}
    >
      <div className="settings-header">
        <h1>Settings</h1>
      </div>
      <div className="settings-content">
        <div className="setting email">
          <label className="label email-address">Email Address</label>
          <input className="input email-input" disabled={true} value={email} />
        </div>
        <div className="setting username">
          <label className="label username">Username</label>
          <input
            className="input username-input"
            disabled={!isEditable}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            ref={usernameInputRef}
          />
          {usernameError && (
            <p className="error-message" style={{ color: "red" }}>
              {usernameError}
            </p>
          )}
        </div>
        <div className="buttons">
          <button className="btn change-password" onClick={handleChangePasswordClick}>
            Change password
          </button>
          <button className="btn edit" onClick={handleEditClick}>
            Edit
          </button>
          <button className="btn save" onClick={handleSaveClick}>
            Save changes
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Change Password
          </Typography>

          <TextField
            label="Current Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={textFieldStyle}
          />

          <TextField
            label="New Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={textFieldStyle}
          />

          <TextField
            label="Confirm New Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            sx={textFieldStyle}
          />

          <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
            <Button
              variant="contained"
              color="secondary"
              style={{
                color: "var(--black",
                backgroundColor: "var(--gold)",
                fontFamily: "Poppins",
              }}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{
                color: "var(--black",
                backgroundColor: "var(--gold)",
                fontFamily: "Poppins",
              }}
              onClick={handlePasswordSubmit}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default Settings;
