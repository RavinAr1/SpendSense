import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  TextField,
  Button,
  Grid,
  Card,
  Box,
} from "@mui/material";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import SavingsIcon from "@mui/icons-material/Savings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [userIncome, setUserIncome] = useState("");
  const [pastSavings, setPastSavings] = useState("");
  const [userBudget, setUserBudget] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData({});
  }, []);

  const handleBudgetChange = (category, value) => {
    setUserBudget({ ...userBudget, [category]: value });
  };

  const fetchDashboardData = async (userInputs) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/user_budget_plan", userInputs);
      setDashboardData(response.data);
    } catch (err) {
      setError("Error connecting to server.");
    }
  };

  const handleSubmit = async () => {
    const userInputs = {
      user_income: userIncome || null,
      past_savings: pastSavings || 0,
      user_budget: Object.fromEntries(
        Object.entries(userBudget).map(([key, value]) => [key, value || null])
      ),
    };

    fetchDashboardData(userInputs);
  };

  const manageableExpenses = ["Eating_Out", "Transport", "Entertainment", "Groceries"];
  const fixedExpenses = ["Education", "Healthcare", "Insurance", "Loan_Repayment", "Miscellaneous", "Rent", "Utilities"];

  return (
    <Container sx={{ mt: 4 }}>
      <Paper elevation={5} sx={{ padding: 4, backgroundColor: "#F5F7FA", borderRadius: "15px" }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          🔹 AI-Powered Budget Planner 🔹
        </Typography>

        {dashboardData ? (
          <>

     {/* Budget Input Form */}
     <Card elevation={3} sx={{ backgroundColor: "#E3F2FD", p: 3, borderRadius: "10px", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>💰 Enter Your Budget Plan (or leave blank for AI estimate):</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Monthly Income"
                type="number"
                size="small"
                fullWidth
                value={userIncome}
                onChange={(e) => setUserIncome(e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Past Savings"
                type="number"
                size="small"
                fullWidth
                value={pastSavings}
                onChange={(e) => setPastSavings(e.target.value)}
              />
            </Grid>
          </Grid>


          

          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3 }}>📊 Enter Expenses (or leave blank for AI estimate):</Typography>
          <Grid container spacing={2}>
            {[...manageableExpenses, ...fixedExpenses].map((category) => (
              <Grid item xs={6} sm={4} md={3} key={category}>
                <TextField
                  label={category}
                  type="number"
                  size="small"
                  fullWidth
                  value={userBudget[category] || ""}
                  onChange={(e) => handleBudgetChange(category, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>




          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3, width: "100%" }}>
            Generate Budget Plan
          </Button>
        </Card>





          {/* Financial Overview */}
            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <Card sx={{ width: "30%", textAlign: "center", p: 2 }}>
                <AccountBalanceWalletIcon fontSize="large" color="primary" />
                <Typography variant="h6">Income</Typography>
                <Typography variant="h5" color="green">
                  ${dashboardData.income_prediction.toFixed(2)}
                </Typography>
              </Card>
              <Card sx={{ width: "30%", textAlign: "center", p: 2 }}>
                <AttachMoneyIcon fontSize="large" color="primary" />
                <Typography variant="h6">Free Budget</Typography>
                <Typography variant="h5" color="blue">
                  ${dashboardData.free_budget.toFixed(2)}
                </Typography>
              </Card>
            </Box>



            <Divider sx={{ my: 3 }} />




            {/* Budget Breakdown */}
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>📊 Budget Breakdown:</Typography>
            
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>💡 Manageable Expenses:</Typography>
            <Grid container spacing={2}>
              {Object.entries(dashboardData.budget_allocations).map(([category, amount]) =>
                manageableExpenses.includes(category) ? (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Paper sx={{ padding: 2, backgroundColor: "#D4EDDA" }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {category}:
                      </Typography>
                      <Typography variant="h6">
                        ${amount.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                ) : null
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* 📌 Fixed Expenses */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3 }}>📌 Fixed Expenses:</Typography>
            <Grid container spacing={2}>
              {Object.entries(dashboardData.budget_allocations).map(([category, amount]) =>
                fixedExpenses.includes(category) ? (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Paper sx={{ padding: 2, backgroundColor: "#FADBD8" }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {category}:
                      </Typography>
                      <Typography variant="h6">
                        ${amount.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                ) : null
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* 📊 NEW Doughnut Charts Section */}
            <Typography variant="h5" sx={{ fontWeight: "bold", mt: 3 }}>
              📊 Financial Overview (Visual Representation)
            </Typography>

            <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
              {/* Doughnut Chart - Income vs. Expenses */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ textAlign: "center" }}>Income vs. Expenses</Typography>
                  <Doughnut
                    data={{
                      labels: ["Income", "Remaining Funds"],
                      datasets: [
                        {
                          data: [
                            dashboardData.income_prediction || 0,
                            dashboardData.free_budget || 0
                          ],
                          backgroundColor: ["#28A745", "#FF5733"],
                        },
                      ],
                    }}
                  />
                </Paper>
              </Grid>

              {/* Doughnut Chart - Manageable Expenses */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ textAlign: "center" }}>Manageable Expenses</Typography>
                  <Doughnut
                    data={{
                      labels: manageableExpenses,
                      datasets: [
                        {
                          data: manageableExpenses.map(
                            (category) => dashboardData.budget_allocations[category] || 0
                          ),
                          backgroundColor: ["#007BFF", "#FFC107", "#28A745", "#17A2B8"],
                        },
                      ],
                    }}
                  />
                </Paper>
              </Grid>

              {/* Doughnut Chart - Fixed Expenses */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ textAlign: "center" }}>Fixed Expenses</Typography>
                  <Doughnut
                    data={{
                      labels: fixedExpenses,
                      datasets: [
                        {
                          data: fixedExpenses.map(
                            (category) => dashboardData.budget_allocations[category] || 0
                          ),
                          backgroundColor: ["#FF5733", "#C70039", "#900C3F", "#581845"],
                        },
                      ],
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Doughnut Chart - Savings vs. Remaining Budget */}
            {/* <Grid container justifyContent="center" sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ textAlign: "center" }}>Savings vs. Remaining Budget</Typography>
                  <Doughnut
                    data={{
                      labels: ["Savings", "Remaining Budget"],
                      datasets: [
                        {
                          data: [
                            dashboardData.savings_recommendations.total_savings || 0,
                            dashboardData.free_budget || 0,
                          ],
                          backgroundColor: ["#17A2B8", "#FFC107"],
                        },
                      ],
                    }}
                  />
                </Paper>
              </Grid>
            </Grid> */}

            <Divider sx={{ my: 3 }} />

                     {/* 💸 Spending Transactions */}
                     <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>💸 Spending Transactions:</Typography>
            <List>
              {dashboardData.transactions.map((transaction, index) => (
                <ListItem key={index}>
                  <MonetizationOnIcon sx={{ color: "#007BFF", mr: 1 }} />
                  <ListItemText
                    primary={`🆕 Spent $${transaction.amount} on ${transaction.category}`}
                    secondary={
                      transaction.remaining_budget >= 0
                        ? `✅ Remaining Budget: $${transaction.remaining_budget.toFixed(2)}`
                        : `⚠️ Over Budget by $${Math.abs(transaction.remaining_budget).toFixed(2)}`
                    }
                  />
                </ListItem>
              ))}
            </List>






            <Divider sx={{ my: 3 }} />

            {/* Savings Recommendations */}
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>💡 Savings Recommendations:</Typography>
            <List>
              {Object.entries(dashboardData.savings_recommendations).map(([category, advice]) => (
                <ListItem key={category}>
                  <SavingsIcon sx={{ color: "#28A745", mr: 1 }} />
                  <ListItemText primary={`✅ ${advice}`} />
                </ListItem>
              ))}
            </List>


            <Divider sx={{ my: 3 }} />




            {/* AI-Generated Financial Advice */}
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>📢 AI-Generated Financial Advice:</Typography>
            <List>
              {Object.entries(dashboardData.financial_advice).map(([category, advice]) => (
                <ListItem key={category}>
                  <WarningAmberIcon sx={{ color: "#FFC107", mr: 1 }} />
                  <ListItemText primary={advice} />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Alert severity="error">{error || "Loading AI-powered insights..."}</Alert>
        )}



      </Paper>
    </Container>
  );
};

export default Dashboard;
