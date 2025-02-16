import React from "react";
import { Container, Typography, Paper, Box, Grid, Card, CardContent, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Insights = () => {
  return (


    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 5,
      }}
    >


      <Container>
        <Paper elevation={4} sx={{ padding: 4, borderRadius: "12px", backgroundColor: "#ffffff" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📚 Improve Your Financial Literacy
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Learn key financial concepts to make smarter money decisions.
          </Typography>




          {/* Financial Literacy Cards */}
          <Grid container spacing={3} justifyContent="center">
            {/* Budgeting */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: "#E3F2FD", borderRadius: "10px" }}>
                <CardContent>
                  <SavingsIcon sx={{ fontSize: 50, color: "#1E88E5" }} />
                  <Typography variant="h6" fontWeight="bold">Budgeting Basics</Typography>
                  <Typography variant="body2">
                    Plan your income and expenses effectively to stay in control of your finances.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>



            {/* Smart Savings */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: "#DFF8E3", borderRadius: "10px" }}>
                <CardContent>
                  <TrendingUpIcon sx={{ fontSize: 50, color: "#28A745" }} />
                  <Typography variant="h6" fontWeight="bold">Smart Savings</Typography>
                  <Typography variant="body2">
                    Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>




            {/* Investing */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: "#FFF3E0", borderRadius: "10px" }}>
                <CardContent>
                  <AccountBalanceIcon sx={{ fontSize: 50, color: "#FF9800" }} />
                  <Typography variant="h6" fontWeight="bold">Investing 101</Typography>
                  <Typography variant="body2">
                    Start small, diversify, and think long-term for financial growth.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>





            {/* Debt Management */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: "#FCE4EC", borderRadius: "10px" }}>
                <CardContent>
                  <MoneyOffIcon sx={{ fontSize: 50, color: "#D81B60" }} />
                  <Typography variant="h6" fontWeight="bold">Managing Debt</Typography>
                  <Typography variant="body2">
                    Pay off high-interest debt first and avoid unnecessary borrowing.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>




            {/* Financial Education */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: "#E8EAF6", borderRadius: "10px" }}>
                <CardContent>
                  <SchoolIcon sx={{ fontSize: 50, color: "#3F51B5" }} />
                  <Typography variant="h6" fontWeight="bold">Continuous Learning</Typography>
                  <Typography variant="body2">
                    Stay informed with financial news and personal finance courses.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>




          {/* Additional Financial Literacy Points */}
          <Box sx={{ mt: 5, textAlign: "left" }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🔍 Additional Financial Tips:
            </Typography>



            <List>


              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#1E88E5" }} />
                </ListItemIcon>
                <ListItemText primary="Build an emergency fund with at least 3-6 months of expenses." />
              </ListItem>



              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#28A745" }} />
                </ListItemIcon>
                <ListItemText primary="Track your spending to identify unnecessary expenses and cut back." />
              </ListItem>



              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#FF9800" }} />
                </ListItemIcon>
                <ListItemText primary="Automate savings to ensure consistent contributions towards financial goals." />
              </ListItem>



              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#D81B60" }} />
                </ListItemIcon>
                <ListItemText primary="Avoid impulse purchases by using a 24-hour rule before spending on non-essentials." />
              </ListItem>



              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#3F51B5" }} />
                </ListItemIcon>
                <ListItemText primary="Monitor your credit score and maintain a good credit history." />
              </ListItem>



              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#1E88E5" }} />
                </ListItemIcon>
                <ListItemText primary="Consider tax-efficient investment options to maximize returns." />
              </ListItem>



              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: "#28A745" }} />
                </ListItemIcon>
                <ListItemText primary="Review your financial goals regularly and adjust based on life changes." />
              </ListItem>


            </List>
            
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Insights;
