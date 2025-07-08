import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Paper
} from "@mui/material";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const result = await res.json();

      if (result.success) {
        localStorage.setItem("username", result.username);
        localStorage.setItem("lastActivity", Date.now());
        navigate("/landing");
      } else {
        setError(result.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again.");
    }
  };

  // 🔐 Allow Enter key to trigger login
  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Enter") {
        // inline version of handleLogin to avoid dependency issues
        (async () => {
          try {
            const res = await fetch("http://127.0.0.1:5000/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password })
            });
  
            const result = await res.json();
  
            if (result.success) {
              localStorage.setItem("username", result.username);
              localStorage.setItem("lastActivity", Date.now());
              navigate("/landing");
            } else {
              setError(result.message || "Login failed.");
            }
          } catch (err) {
            console.error("Login error:", err);
            setError("Server error. Please try again.");
          }
        })();
      }
    };
  
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [username, password, navigate]);
  

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundImage: "url('/assets/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        m: 0,
        p: 0,
      }}
    >
      {/* 🔵 Top-left logo */}
      <Box
        component="img"
        src="/assets/spendsenseLogo.jpg"
        alt="SpendSense Logo"
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          width: 100,
          height: "auto",
        }}
      />

      {/* 🔐 Login Form */}
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 350,
          backgroundColor: "rgba(0, 0, 0, 0.65)", // dark translucent background
          color: "white",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography variant="h5" align="center" mb={3}>
          🔐 SpendSense Login
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <TextField
          label="Username"
          fullWidth
          variant="filled"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ style: { backgroundColor: "white" } }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          variant="filled"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ style: { backgroundColor: "white" } }}
        />

        <Button variant="contained" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
