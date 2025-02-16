import React from "react";
import { Container, Typography, Avatar, Paper } from "@mui/material";

const UserProfile = () => {
  return (
    
    <Container sx={{ textAlign: "center", mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 500,
          margin: "auto",
          background: "rgba(0, 0, 0, 0.7)", 
          backdropFilter: "blur(15px)",
          borderRadius: 5,
          boxShadow: "0 8px 32px rgba(255, 255, 255, 0.2)"
        }}
      >

        
        <Avatar
          alt="User Profile"
          src="/assets/user.jpg"
          sx={{
            width: 120,
            height: 120,
            margin: "auto",
            mb: 2,
            border: "4px solid rgba(255, 255, 255, 0.3)"
          }}
        />



        <Typography variant="h4" fontWeight="bold" color="white">
        J.R.R. Tolkien
        </Typography>
        <Typography variant="h6" color="#ccc">
          Famous Writer
        </Typography>


      </Paper>
    </Container>
  );
};

export default UserProfile;
