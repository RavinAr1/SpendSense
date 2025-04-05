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
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import RefreshIcon from "@mui/icons-material/Refresh";

import SavingsIcon from "@mui/icons-material/Savings";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
// import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SmsIcon from "@mui/icons-material/Sms";

import CircularProgress from "@mui/material/CircularProgress";
import { Bar } from "react-chartjs-2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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


  const [allSmsData, setAllSmsData] = useState([]);



  useEffect(() => {
    fetchDashboardData({});
    fetchSmsTransactions();
  }, []);






  const prepareComparisonChart = () => {
    const categories = [...manageableExpenses, ...fixedExpenses];
  
    const budgetData = categories.map(cat =>
      dashboardData?.budget_allocations?.[cat] || 0
    );
  


    const smsTotals = {};
    allSmsData
      .filter(txn => txn.type === "debit" && !txn.is_anomaly)

      .forEach(txn => {
        const cat = txn.category;
        if (categories.includes(cat)) {
          smsTotals[cat] = (smsTotals[cat] || 0) + txn.amount;
        }
      });


      
  
    const smsData = categories.map(cat => smsTotals[cat] || 0);
  
    return {
      labels: categories,
      datasets: [
        {
          label: "AI Budget (Estimated)",
          data: budgetData,
          backgroundColor: "#42A5F5"
        },
        {
          label: "SMS Expenses (Actual)",
          data: smsData,
          backgroundColor: "#FF7043"
        }
      ]
    };
  };
  
  
  












  const handleSyncSms = async () => {
    setLoadingSms(true);
    try {
      const parseRes = await axios.get("http://127.0.0.1:5000/parse_sms_messages_gemini");
  
      // optional: toast if no new transactions
      if (
        !parseRes.data ||
        !parseRes.data.new_transactions ||
        parseRes.data.new_transactions.length === 0
      ) {
        toast.info("No new transactions found.");
      } else {
        parseRes.data.new_transactions.forEach((txn) => {
          if (txn.type === "debit") {
            toast.success(
              `💸 $${txn.amount} spent at ${txn.vendor} for ${txn.category}`,
              { autoClose: 6000 }
            );
          } else if (txn.type === "credit") {
            toast.info(
              `💰 $${txn.amount} received from ${txn.vendor} (${txn.category})`,
              { autoClose: 6000 }
            );
          }
        });
      }
  
      await fetchSmsTransactions(); // refresh both recent and all
    } catch (err) {
      console.error("Error syncing SMS messages:", err);
      toast.error("Failed to sync SMS messages.");
    } finally {
      setLoadingSms(false);
    }
  };
  
  






  const [enrichStatus, setEnrichStatus] = useState("");
  
  const handleEnrichAnomalies = async () => {
    setEnrichStatus("🧠 Enriching 5 anomaly messages...");
    try {
      const res = await axios.post("http://127.0.0.1:5000/enrich_anomaly_sms_batch");
      setEnrichStatus(`✅ ${res.data.count} messages enriched`);
      await fetchSmsTransactions(); // refresh updated transactions
    } catch (err) {
      console.error("Enrichment failed", err);
      setEnrichStatus("❌ Enrichment failed.");
    } finally {
      setTimeout(() => setEnrichStatus(""), 5000);
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
      const [recentRes, allRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/recent_sms_transactions"),
        axios.get("http://127.0.0.1:5000/all_sms_transactions")
      ]);
  
      setSmsTransactions(recentRes.data.recent_transactions || []);
      setAllSmsData(allRes.data.all_transactions || []);
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
      <ToastContainer position="bottom-right" autoClose={3000} />

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


{/* === AI Estimated Budget Cards === */}
<Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 1 }}>
  <Typography variant="h6" fontWeight="bold">
    🔹 Estimated Budget (AI)
  </Typography>
<Button
  size="small"
  variant="text"
  color="info"
  startIcon={<RefreshIcon />}
  onClick={fetchSmsTransactions}
>
  Refresh
</Button>

</Box>

<Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mb={3}>
  {/* Income */}
  <Card sx={{ width: "22%", minWidth: "250px", textAlign: "center", p: 2 }}>
    <AccountBalanceWalletIcon fontSize="large" color="primary" />
    <Typography variant="h6">Income</Typography>
    <Typography variant="h5" color="green">
      ${safeToFixed(dashboardData.income_prediction)}
    </Typography>
  </Card>

  {/* Estimated Expenses */}
  <Card sx={{ width: "22%", minWidth: "250px", textAlign: "center", p: 2 }}>
    <MonetizationOnIcon fontSize="large" color="warning" />
    <Typography variant="h6">Estimated Expenses</Typography>
    <Typography variant="h5" color="warning.main">
      $
      {safeToFixed(
        Object.values(dashboardData.budget_allocations || {}).reduce((a, b) => a + b, 0)
      )}
    </Typography>
  </Card>
</Box>

{/* === Actual SMS-Based Cards === */}
<Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: "bold" }}>
  🔹 Actual Spending (SMS)
</Typography>
<Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mb={3}>
  {/* Credit Received (SMS) */}
  <Card sx={{ width: "22%", minWidth: "250px", textAlign: "center", p: 2, backgroundColor: "#E8F5E9" }}>
    <MonetizationOnIcon fontSize="large" color="success" />
    <Typography variant="h6">Credit Received (SMS)</Typography>
    <Typography variant="h5" color="success.main">
      ${safeToFixed(allSmsData.filter(txn => txn.type === "credit").reduce((sum, t) => sum + t.amount, 0))}
    </Typography>
    <Button
      variant="text"
      size="small"
      onClick={() => {
        const creditTotal = allSmsData
          .filter((txn) => txn.type === "credit")
          .reduce((sum, t) => sum + t.amount, 0);
        setUserIncome((prev) => (parseFloat(prev || 0) + creditTotal).toFixed(2));
      }}
      sx={{ mt: 1 }}
    >
      + Add to Income
    </Button>
  </Card>



  {/* Expenses from SMS */}
  <Card sx={{ width: "22%", minWidth: "250px", textAlign: "center", p: 2 }}>
    <SmsIcon fontSize="large" color="info" />
    <Typography variant="h6">Expenses (SMS)</Typography>
    <Typography variant="h5" color="info.main">
      $
      {safeToFixed(
        allSmsData
        .filter((txn) => txn.type === "debit" && !txn.is_anomaly)
        .reduce((sum, t) => sum + t.amount, 0)
      )}
    </Typography>
  </Card>




 {/* Sync SMS + Enrich */}
{/* Sync SMS + Enrich */}
<Card sx={{ width: "22%", minWidth: "250px", textAlign: "center", p: 2 }}>
  <SmsIcon fontSize="large" color="secondary" />
  <Typography variant="h6">SMS Actions</Typography>


  {loadingSms ? (
    <Box display="flex" flexDirection="column" alignItems="center" mt={1}>
      <CircularProgress size={24} />
      <Typography variant="body2" color="textSecondary">Parsing SMS...</Typography>
    </Box>
  ) : (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={async () => {
          await handleSyncSms();
          await handleEnrichAnomalies();
        }}
        sx={{ mt: 1 }}
      >
        🔄 Sync + Enrich
      </Button>

      {enrichStatus && (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 1, display: "block" }}
        >
          {enrichStatus}
        </Typography>
      )}
    </>
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
            <Grid container spacing={2} justifyContent="center" alignItems="stretch">
            {/* Donut Chart - Smaller */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" align="center" title="Free Budget = Income - Estimated Expenses">
                  💰 Income vs. Remaining
                </Typography>
                <Doughnut
                  data={{
                    labels: ["Income", "Remaining"],
                    datasets: [
                      {
                        data: [
                          dashboardData.income_prediction || 0,
                          dashboardData.free_budget || 0,
                        ],
                        backgroundColor: ["#28A745", "#FF5733"],
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (tooltipItem) => {
                            const value = tooltipItem.raw;
                            return `$${safeToFixed(value)}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </Paper>
            </Grid>

            {/* Bar Chart - Larger */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" align="center">
                  📊 Budget vs Actual Spending (via SMS)
                </Typography>
                <Bar data={prepareComparisonChart()} />
              </Paper>
            </Grid>
          </Grid>


            <Divider sx={{ my: 3 }} />

            {/* === AI Transactions === */}


            <Divider sx={{ my: 3 }} />
              <Grid container spacing={2}>
                {/* === AI Predicted Transactions === */}
                <Grid item xs={12} md={6}>
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
                </Grid>




                {/* === SMS Synced Transactions === */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" fontWeight="bold" mb={1}>📲 SMS Synced Transactions</Typography>
                  <Button
                    variant="outlined"
                    sx={{ mb: 2 }}
                    onClick={() => window.location.href = "/transactions"}
                  >
                    View All Transactions
                  </Button>
                  <List>
                    {smsTransactions.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="No SMS transaction data available." />
                      </ListItem>
                    ) : (




                      smsTransactions.map((txn, index) => (
                        <ListItem key={index} sx={{ bgcolor: txn.is_anomaly ? "#fff3cd" : "inherit" }}>
                        <SmsIcon sx={{ color: txn.is_anomaly ? "#ff9800" : "#6C63FF", mr: 1 }} />
                        <ListItemText
                          primary={`$${txn.amount} spent at ${txn.vendor}`}
                          secondary={
                            <>
                              🗓️ {txn.date} | 📂 {txn.category}
                              {txn.is_anomaly && (
                                <Typography variant="caption" color="error" display="block">
                                  ⚠️ Potential Anomaly
                                </Typography>
                              )}
                            </>
                          }
                        />
                        {txn.is_anomaly && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={async () => {
                              try {
                                await axios.post("http://127.0.0.1:5000/validate_sms_transaction", {
                                  transaction_id: txn.id || txn._id || index, // depends on your backend ID
                                });
                                toast.success("Marked as valid ✅");
                                await fetchSmsTransactions(); // refresh data
                              } catch (err) {
                                toast.error("Failed to validate.");
                              }
                            }}
                          >
                            Mark as Valid
                          </Button>
                        )}
                      </ListItem>
                      ))
                    )}
                    
                  </List>
                </Grid>
              </Grid>












            {/* === Recommendations === */}

            <Divider sx={{ my: 3 }} />
<Grid container spacing={2}>
  {/* 💡 Savings Recommendations */}
  <Grid item xs={12} md={6}>
    <Typography variant="h5" fontWeight="bold" mb={1}>💡 Savings Recommendations</Typography>
    <List>
      {Object.entries(dashboardData.savings_recommendations || {}).map(([cat, msg]) => (
        <ListItem key={cat}>
          <SavingsIcon sx={{ color: "#28A745", mr: 1 }} />
          <ListItemText primary={msg} />
        </ListItem>
      ))}
    </List>
  </Grid>

  {/* 📢 AI Financial Advice */}
  <Grid item xs={12} md={6}>
    <Typography variant="h5" fontWeight="bold" mb={1}>📢 AI Financial Advice</Typography>
    <List>
      {Object.entries(dashboardData.financial_advice || {}).map(([cat, msg]) => (
        <ListItem key={cat}>
          <WarningAmberIcon sx={{ color: "#FFC107", mr: 1 }} />
          <ListItemText primary={msg} />
        </ListItem>
      ))}
    </List>
  </Grid>
</Grid>








          </>
        ) : (
          <Alert severity="info">{error || "Loading AI-powered insights..."}</Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
