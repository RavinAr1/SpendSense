import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar,
  IconButton, Menu, MenuItem
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("lastActivity");
    handleClose();
    navigate("/");
  };

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
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          AI Insights
        </Typography>

        <Button color="inherit" component={Link} to="/home">Home</Button>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        <Button color="inherit" component={Link} to="/insights">Stock Insights</Button>
        <Button color="inherit" component={Link} to="/transactions">Transactions</Button>

        {username && (
          <Box ml={2} display="flex" alignItems="center">
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32 }} />
              <ArrowDropDownIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2" fontWeight="bold">{username}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
