import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <Drawer variant="permanent" sx={{ width: 240 }}>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/insights">
          <ListItemText primary="Insights" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
