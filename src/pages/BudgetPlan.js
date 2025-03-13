import React, { useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Paper } from "@mui/material";

const BudgetPlan = () => {
  const [userIncome, setUserIncome] = useState("");
  const [pastSavings, setPastSavings] = useState("");
  const [userBudget, setUserBudget] = useState({
    Groceries: "",
    Eating_Out: "",
    Entertainment: "",
    Transport: ""
  });
  const [budgetData, setBudgetData] = useState(null);
  const [error, setError] = useState(null);

  const handleBudgetChange = (category, value) => {
    setUserBudget({ ...userBudget, [category]: value });
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:5000/user_budget_plan", {
        user_income: userIncome.trim() !== "" ? parseFloat(userIncome) : null, // If empty, AI will estimate
        past_savings: pastSavings.trim() !== "" ? parseFloat(pastSavings) : 0, // Defaults to 0
        user_budget: Object.fromEntries(
          Object.entries(userBudget).map(([key, value]) =>
            value.trim() !== "" ? [key, parseFloat(value)] : [key, null]
          ) // Sends user-entered values or null for AI estimation
        )
      });

      setBudgetData(response.data);
    } catch (err) {
      setError("Error connecting to server. Make sure Flask is running.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          💰 AI-Powered Budget Planner
        </Typography>

        <TextField
          label="Enter your expected monthly income (or leave blank for AI estimate)"
          type="number"
          fullWidth
          value={userIncome}
          onChange={(e) => setUserIncome(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Enter your current past savings (optional)"
          type="number"
          fullWidth
          value={pastSavings}
          onChange={(e) => setPastSavings(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography variant="h6">📊 Enter your planned budget per category (or leave blank for AI estimate):</Typography>
        {["Groceries", "Eating_Out", "Entertainment", "Transport"].map((category) => (
          <TextField
            key={category}
            label={category}
            type="number"
            fullWidth
            value={userBudget[category]}
            onChange={(e) => handleBudgetChange(category, e.target.value)}
            sx={{ mt: 2 }}
          />
        ))}

        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
          Generate Budget Plan
        </Button>

        {budgetData && (
          <>
            <Typography variant="h5" sx={{ mt: 3 }}>✅ Your Monthly Budget Plan:</Typography>
            <Typography variant="h6">
              🔹 Monthly Income: ${budgetData.income_prediction.toFixed(2)} ({budgetData.income_source})
            </Typography>
            <Typography variant="h6">💰 Free Budget: ${budgetData.free_budget.toFixed(2)}</Typography>
            <Typography variant="h6">💾 Past Savings: ${budgetData.past_savings.toFixed(2)}</Typography>

            <Typography variant="h5" sx={{ mt: 3 }}>📊 Budget Breakdown:</Typography>
            <ul>
              {Object.entries(budgetData.budget_allocations).map(([category, amount]) => (
                <li key={category}>{category}: ${amount.toFixed(2)}</li>
              ))}
            </ul>
          </>
        )}

        {error && <Typography color="error">{error}</Typography>}
      </Paper>
    </Container>
  );
};

export default BudgetPlan;
