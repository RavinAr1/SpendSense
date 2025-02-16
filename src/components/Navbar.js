import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import spendsenseLogo from "../assets/spendsenseLogo.jpg"; 

const Navbar = () => {
  return (
    <AppBar
  position="sticky"
  sx={{
    backgroundImage: "url('/assets/hero.jpg')", 
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: "white", 
  }}
>
 

      <Toolbar>
        {/* Clickable Logo to Redirect to Landing Page) */}
        {/* <Link to="/">
          <img src={spendsenseLogo} alt="SpendSense Logo" style={{ height: "40px", marginRight: "15px" }} />
        </Link> */}

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          AI Insights
        </Typography>
        <Button color="inherit" component={Link} to="/home">
          Home
        </Button>
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/insights">
          Insights
        </Button>

        <Button color="inherit" component={Link} to="/profile">
        Profile
        </Button>


      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
