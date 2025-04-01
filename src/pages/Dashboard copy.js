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
import SmsIcon from "@mui/icons-material/Sms";

import CircularProgress from "@mui/material/CircularProgress";




ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [userIncome, setUserIncome] = useState("");
  const [pastSavings, setPastSavings] = useState("");
  const [userBudget, setUserBudget] = useState({});
  const [smsTransactions, setSmsTransactions] = useState([]);
  const [error, setError] = useState(null);

  const [loadingSms, setLoadingSms] = useState(false);

  const manageableExpenses = ["Eating_Out", "Transport", "Entertainment", "Groceries"];
  const fixedExpenses = ["Healthcare", "Insurance", "Miscellaneous", "Rent", "Utilities"];

  useEffect(() => {
    fetchDashboardData({});
    fetchSmsTransactions();
  }, []);




  const handleSyncSms = async () => {
    setLoadingSms(true);
    try {
      await axios.get("http://127.0.0.1:5000/parse_sms_messages_gemini");
      await fetchSmsTransactions();
    } catch (err) {
      console.error("Error syncing SMS messages:", err);
    } finally {
      setLoadingSms(false);
    }
  };
  
  
  




  const handleBudgetChange = (category, value) => {
    setUserBudget({ ...userBudget, [category]: value });
  };

  const fetchDashboardData = async (userInputs) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/user_budget_plan", userInputs);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError("Error connecting to server.");
    }
  };

  const fetchSmsTransactions = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/recent_sms_transactions");
      const txns = response.data.recent_transactions || [];
      setSmsTransactions(txns);
    } catch (err) {
      console.error("Error fetching SMS transactions:", err);
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

  const safeToFixed = (value) => {
    return typeof value === "number" ? value.toFixed(2) : "0.00";
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper elevation={5} sx={{ padding: 4, backgroundColor: "#F5F7FA", borderRadius: "15px" }}>
        <Typography variant="h4" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          🔹 AI-Powered Budget Planner 🔹
        </Typography>

        {/* === Input Section === */}
        <Card elevation={3} sx={{ backgroundColor: "#E3F2FD", p: 3, borderRadius: "10px", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            💰 Enter Your Budget Plan (or leave blank for AI estimate):
          </Typography>
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

          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3 }}>
            📊 Enter Expenses (or leave blank for AI estimate):
          </Typography>

          <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
            Leave any field blank to let AI estimate it. Enter a value to override with your own.
          </Typography>

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

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 3, width: "100%" }}
          >
            Generate Budget Plan
          </Button>
        </Card>

        {/* === Results Section === */}
        {dashboardData ? (
          <>
            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <Card sx={{ width: "30%", textAlign: "center", p: 2 }}>
                <AccountBalanceWalletIcon fontSize="large" color="primary" />
                <Typography variant="h6">Income</Typography>
                <Typography variant="h5" color="green">
                  ${safeToFixed(dashboardData.income_prediction)}
                </Typography>
              </Card>

              <Card sx={{ width: "30%", textAlign: "center", p: 2 }}>
                <AttachMoneyIcon fontSize="large" color="primary" />
                <Typography variant="h6">Free Budget</Typography>
                <Typography variant="h5" color="blue">
                  ${safeToFixed(dashboardData.free_budget)}
                </Typography>
              </Card>

              <Card sx={{ width: "30%", textAlign: "center", p: 2 }}>
                <SmsIcon fontSize="large" color="secondary" />
                <Typography variant="h6">Sync SMS</Typography>

                {loadingSms ? (
                  <Box display="flex" flexDirection="column" alignItems="center" mt={1}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="textSecondary">Parsing SMS...</Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSyncSms}
                    startIcon={<SmsIcon />}
                    disabled={loadingSms}
                  >
                    Fetch SMS Transactions
                  </Button>
                )}
              </Card>

            </Box>


            <Divider sx={{ my: 3 }} />

            {/* === Budget Breakdown === */}
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              📊 Budget Breakdown
            </Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>💡 Manageable Expenses:</Typography>
            <Grid container spacing={2}>
              {Object.entries(dashboardData.budget_allocations || {}).map(
                ([category, amount]) =>
                  manageableExpenses.includes(category) && (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Paper sx={{ p: 2, backgroundColor: "#D4EDDA" }}>
                        <Typography variant="body1" fontWeight="bold">{category}:</Typography>
                        <Typography variant="h6">${safeToFixed(amount)}</Typography>
                      </Paper>
                    </Grid>
                  )
              )}
            </Grid>

            <Typography variant="h6" sx={{ mt: 3 }}>📌 Fixed Expenses:</Typography>
            <Grid container spacing={2}>
              {Object.entries(dashboardData.budget_allocations || {}).map(
                ([category, amount]) =>
                  fixedExpenses.includes(category) && (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Paper sx={{ p: 2, backgroundColor: "#FADBD8" }}>
                        <Typography variant="body1" fontWeight="bold">{category}:</Typography>
                        <Typography variant="h6">${safeToFixed(amount)}</Typography>
                      </Paper>
                    </Grid>
                  )
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* === Charts === */}
            <Typography variant="h5" fontWeight="bold" mt={3}>📊 Visual Charts</Typography>
            <Grid container spacing={3} justifyContent="center" mt={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" align="center">Income vs. Remaining</Typography>
                  <Doughnut
                    data={{
                      labels: ["Income", "Remaining"],
                      datasets: [{
                        data: [dashboardData.income_prediction || 0, dashboardData.free_budget || 0],
                        backgroundColor: ["#28A745", "#FF5733"]
                      }]
                    }}
                  />
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* === AI Transactions === */}
            <Typography variant="h5" fontWeight="bold" mb={1}>💸 AI Predicted Transactions</Typography>
            <List>
              {(dashboardData.transactions || []).map((txn, index) => (
                <ListItem key={index}>
                  <MonetizationOnIcon sx={{ color: "#007BFF", mr: 1 }} />
                  <ListItemText
                    primary={`Spent $${txn.amount} on ${txn.category}`}
                    secondary={
                      txn.remaining_budget >= 0
                        ? `✅ Remaining: $${safeToFixed(txn.remaining_budget)}`
                        : `⚠️ Over Budget by $${safeToFixed(Math.abs(txn.remaining_budget))}`
                    }
                  />
                </ListItem>
              ))}
            </List>

            {/* === SMS Transactions === */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" fontWeight="bold" mb={1}>📲 SMS Synced Transactions</Typography>
            <List>
              {smsTransactions.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No SMS transaction data available." />
                </ListItem>
              ) : (
                smsTransactions.map((txn, index) => (
                  <ListItem key={index}>
                    <SmsIcon sx={{ color: "#6C63FF", mr: 1 }} />
                    <ListItemText
                      primary={`$${txn.amount} spent at ${txn.vendor}`}
                      secondary={`🗓️ ${txn.date} | 📂 ${txn.category}`}
                    />
                  </ListItem>
                ))
              )}
            </List>

            {/* === Recommendations === */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" fontWeight="bold" mb={1}>💡 Savings Recommendations</Typography>
            <List>
              {Object.entries(dashboardData.savings_recommendations || {}).map(([cat, msg]) => (
                <ListItem key={cat}>
                  <SavingsIcon sx={{ color: "#28A745", mr: 1 }} />
                  <ListItemText primary={msg} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" fontWeight="bold" mb={1}>📢 AI Financial Advice</Typography>
            <List>
              {Object.entries(dashboardData.financial_advice || {}).map(([cat, msg]) => (
                <ListItem key={cat}>
                  <WarningAmberIcon sx={{ color: "#FFC107", mr: 1 }} />
                  <ListItemText primary={msg} />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Alert severity="info">{error || "Loading AI-powered insights..."}</Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
