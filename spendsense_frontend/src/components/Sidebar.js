import React from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Box, Typography } from "@mui/material";
import { Home, Dashboard, Insights, Person } from "@mui/icons-material";
import { Link } from "react-router-dom";
import spendsenseLogo from "../assets/spendsenseLogo.jpg";

const Sidebar = () => {


  return (


<Drawer
  variant="permanent"
  sx={{
    width: 240,
    flexShrink: 0,
    "& .MuiDrawer-paper": { 
      width: 240, 
      boxSizing: "border-box",
      display: "flex", 
      flexDirection: "column",
      backgroundImage: "url('/assets/hero.jpg')", 
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "black", 
      
    },
  }}
>



      <Box sx={{ textAlign: "center", padding: "10px", mt: 1 }}>
        <Link to="/">
          <img
            src={spendsenseLogo}
            alt="SpendSense Logo"
            style={{ height: "100px", width: "100px", display: "block", margin: "0 auto" }}
          />
        </Link>
        

        <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
          SpendSense
        </Typography>

      </Box>



      <Toolbar />
      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        <List>

          
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/home">
              <Home sx={{ mr: 2 }} />
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>


          <ListItem disablePadding>
            <ListItemButton component={Link} to="/dashboard">
              <Dashboard sx={{ mr: 2 }} />
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>


          <ListItem disablePadding>
            <ListItemButton component={Link} to="/insights">
              <Insights sx={{ mr: 2 }} />
              <ListItemText primary="Stock Insights" />
            </ListItemButton>
          </ListItem>


          <ListItem disablePadding>
            <ListItemButton component={Link} to="/transactions">
              <Person sx={{ mr: 2 }} />
              <ListItemText primary="Transactions" />
            </ListItemButton>
          </ListItem>


        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
