// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1e88e5" },
    secondary: { main: "#f50057" },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

export default theme;
