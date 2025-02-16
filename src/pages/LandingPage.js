import React from "react";
import { Container, Button, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (


    <Box
      sx={{
        height: "100vh",
        backgroundImage: "url('/assets/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative", 
      }}
    >


      <Box
        component="img"
        src="/assets/spendsenseLogo.jpg"
        alt="SpendSense Logo"
        sx={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "200px", 
          height: "auto",
          opacity: 1, 
        }}
      />



      <Container maxWidth="md">
        <Typography variant="h2" fontWeight="bold" color="black" gutterBottom>
          Welcome to SpendSense
        </Typography>
        <Typography variant="h5" color="black" paragraph>
          Unlock AI-driven financial insights with ease.
        </Typography>
        <Button
          variant="contained"
          color="primary" 
          size="large"
          component={Link}
          to="/home"
        >


          Get Started
        </Button>
      </Container>
    </Box>
  );
};

export default LandingPage;
