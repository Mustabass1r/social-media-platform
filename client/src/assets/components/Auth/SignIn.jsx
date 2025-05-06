import React, { useEffect, useState } from "react";
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

const SignIn = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/home"); // Redirect to home if user is already logged in
    }
  }, [navigate]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSignIn = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/users/login`, {
        username,
        password,
      });

      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/home");
      }
    } catch (error) {
      setErrorMessage("Invalid credentials");
    }
  };

  const forgetPassword = () => {
    console.log("Redirecting to forget password page...");
  };

  const register = () => {
    navigate("/signup"); // Correctly navigate to the register page
  };

  return (
    <Paper
      elevation={12}
      style={{
        width: "34rem",
        height: "32rem",
        margin: "14vh auto",
        padding: "1rem",
        backgroundColor: "var(--component-bg)",
        borderRadius: "1.7rem",
        color: "var(--text-primary)",
      }}
    >
      <Stack spacing={3}>
        {/* Username Input */}
        <Box
          sx={{ display: "flex", alignItems: "flex-end" }}
          style={{ marginTop: "4rem", marginLeft: "auto", marginRight: "auto" }}
        >
          <AccountCircle sx={{ color: "gray", mr: 1, my: 0.5 }} />
          <TextField
            label="Username"
            variant="standard"
            sx={textFieldStyle}
            style={{ marginRight: "2rem" }}
            value={username} // Bind the value to the state
            onChange={(e) => setUsername(e.target.value)} // Update state on input change
          />
        </Box>

        {/* Password Input */}
        <FormControl
          sx={textFieldStyle}
          variant="standard"
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
          <Input
            id="standard-adornment-password"
            type={showPassword ? "text" : "password"}
            value={password} // Bind the value to the state
            onChange={(e) => setPassword(e.target.value)} // Update state on input change
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

        {errorMessage && (
          <div style={{ color: "red", textAlign: "center" }}>
            {errorMessage}
          </div>
        )}

        <label
          className="forget-password"
          style={{ marginLeft: "auto", marginRight: "6rem", cursor: "pointer" }}
          onClick={forgetPassword}
        >
          Forget Password?
        </label>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "var(--gold)",
            color: "black",
            fontWeight: "500",
          }}
          style={{ width: "20rem", marginLeft: "auto", marginRight: "auto" }}
          onClick={handleSignIn}
        >
          Sign In
        </Button>

        <label
          className="register-btn"
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            cursor: "pointer",
          }}
          onClick={register}
        >
          Don't have an account?
        </label>
      </Stack>
    </Paper>
  );
};

export default SignIn;
