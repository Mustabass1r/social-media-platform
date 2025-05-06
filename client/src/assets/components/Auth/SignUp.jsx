import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import AccountCircle from "@mui/icons-material/AccountCircle";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import "./signIn.css";
import axios from "axios";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const textFieldStyle = {
  width: "20rem",
  "& .MuiInput-underline:before": {
    borderBottomColor: "white", // Default underline color
  },
  "& .MuiInput-underline:hover:before": {
    borderBottomColor: "var(--gold)", // Hover underline color
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "var(--gold)", // Focused underline color
  },
  "& .MuiInputBase-input": {
    color: "white", // Text color
  },
  "& .MuiInputLabel-root": {
    color: "white", // Label color
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--gold)", // Focused label color
  },
};

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [open, setOpen] = React.useState(false);
  const handleOpen = async () => {
    if (!validateInputs()) {
      return; // Exit if validations fail
    }
    setOpen(true);
  };


  const handleSubmit = async () => {
    
    try {
      console.log("SignUp button clicked");

      console.log("Selected Categories:", selectedCategories);

      const response = await axios.post("http://localhost:3000/users/signup", {
        email,
        username,
        password,
        selectedCategories,
      });

      console.log("User registered successfully:", response.data);
      localStorage.setItem("user" , JSON.stringify(response.data));
      navigate("/home"); // Redirect to a success page or another route
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response.data.message || "An error occurred during signup"
        );
        console.error("API Error:", error.response.data.message);
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again later.");
        console.error("Request Error:", error.request);
      } else {
        setErrorMessage("An unexpected error occurred.");
        console.error("Error:", error.message);
      }

    }
  };

  const handleClose = async () => {
    if (selectedCategories.length > 0) {
      console.log("Selected Categories:", selectedCategories); // Access the selected categories here
      console.log(Array.isArray(selectedCategories));
      await handleSubmit();
      setOpen(false);
      setSelectedCategories([]);
    } else {
      alert("Please select at least one category before closing.");
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setSelectedCategories((prev) => {
      if (checked) {
        // Only add the category if it doesn't already exist in the array
        if (!prev.includes(name)) {
          return [...prev, name];
        }
        return prev; // If it already exists, return the current array
      } else {
        // Remove the category from the array if unchecked
        return prev.filter((category) => category !== name);
      }
    });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => event.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!username) {
      newErrors.username = "Username is required.";
      valid = false;
    } else if (!usernameRegex.test(username)) {
      newErrors.username =
        "Username must be 3-20 characters long and contain only letters, numbers, and underscores.";
      valid = false;
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters long, with at least one letter, one number, and one special character.";
      valid = false;
    }

    // Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignUp = async () => {
    handleOpen();
  };

  const handleSignInRedirect = () => {
    navigate("/"); // Navigate to the SignIn page
  };


  return (
    <Paper
      elevation={12}
      style={{
        width: "34rem",
        minHeight: "37rem",
        margin: "10vh auto",
        padding: "1rem",
        backgroundColor: "var(--component-bg)",
        borderRadius: "1.7rem",
        color: "var(--text-primary)",
        overflow: "auto",
      }}
    >
      <Stack spacing={3}>
        {/* Username Input */}
        <Box
          sx={{ display: "flex", alignItems: "flex-end" }}
          style={{ marginTop: "2rem", marginLeft: "auto", marginRight: "auto" }}
        >
          <AccountCircle sx={{ color: "gray", mr: 1, my: 0.5 }} />
          <TextField
            label="Username"
            variant="standard"
            sx={textFieldStyle}
            style={{ marginRight: "2rem" }}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Box>

        {/* Email Address Input */}
        <Box
          sx={{ display: "flex", alignItems: "flex-end" }}
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          <AccountCircle sx={{ color: "gray", mr: 1, my: 0.5 }} />
          <TextField
            label="Email Address"
            variant="standard"
            sx={textFieldStyle}
            style={{ marginRight: "2rem" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Box>

        {/* Password Input */}
        <FormControl
          sx={textFieldStyle}
          variant="standard"
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          <InputLabel htmlFor="standard-adornment-password">
            Password
          </InputLabel>
          <Input
            id="standard-adornment-password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{ color: "white" }}
                  style={{ marginRight: "0.3px" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        {/* Confirm Password Input */}
        <FormControl
          sx={textFieldStyle}
          variant="standard"
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          <InputLabel htmlFor="standard-adornment-confirm-password">
            Confirm Password
          </InputLabel>
          <Input
            id="standard-adornment-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{ color: "white" }}
                  style={{ marginRight: "0.3px" }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        {/* Sign Up Button */}
        <Button
          variant="contained"
          onClick={handleSignUp}
          sx={{
            backgroundColor: "var(--gold)",
            color: "black",
            fontWeight: "500",
          }}
          style={{
            width: "20rem",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "3rem",
          }}
        >
          Sign Up
        </Button>

        <label
          className="register-btn"
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            cursor: "pointer",
          }}
          onClick={handleSignInRedirect}
        >
          Already have an account? Sign In
        </label>
      </Stack>
      <div
        style={{
          display: "flex",
          flexDirection: "column", 
          justifyContent: "center",
          alignItems: "center", 
          marginTop: "1rem", 
        }}
      >
        {errors.username && (
          <div style={{ color: "red" }}>{errors.username}</div>
        )}
        {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
        {errors.password && (
          <div style={{ color: "red" }}>{errors.password}</div>
        )}
        {errors.confirmPassword && (
          <div style={{ color: "red" }}>{errors.confirmPassword}</div>
        )}

        {errorMessage && (
          <div style={{ color: "red", textAlign: "center" }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Modal for sign up processing */}
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleClose();
          }
        }}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={style}>
          <h2 id="parent-modal-title">
            Select Categories in which you are interested in
          </h2>
          <div id="parent-modal-description">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox name="Technology" onChange={handleCheckboxChange} />
                }
                label="Technology"
              />
              <FormControlLabel
                control={
                  <Checkbox name="Food" onChange={handleCheckboxChange} />
                }
                label="Food"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="Movies and shows"
                    onChange={handleCheckboxChange}
                  />
                }
                label="Movies and shows"
              />
              <FormControlLabel
                control={
                  <Checkbox name="News" onChange={handleCheckboxChange} />
                }
                label="News"
              />
              <FormControlLabel
                control={
                  <Checkbox name="Vehicles" onChange={handleCheckboxChange} />
                }
                label="Vehicles"
              />
            </FormGroup>
          </div>
          <Button
            variant="contained"
            onClick={handleClose}
            disabled={selectedCategories.length === 0}
          >
            Select
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "var(--component-bg)",
  border: "1px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  borderradius: "2rem",
};

export default SignUp;
