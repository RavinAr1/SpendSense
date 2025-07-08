import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('/assets/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backdropFilter: "blur(6px)",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h2" fontWeight="bold" color="black" gutterBottom>
          Welcome to SpendSense
        </Typography>
        <Typography variant="h5" color="black">
          Unlock AI-driven financial insights with ease.
        </Typography>
      </Container>
    </Box>
  );
};

export default LandingPage;
