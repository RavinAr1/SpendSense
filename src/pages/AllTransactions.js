import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import SmsIcon from "@mui/icons-material/Sms";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/all_sms_transactions");
        setTransactions(res.data.all_transactions || []);
      } catch (err) {
        console.error("Failed to load transactions", err);
      }
    };
    fetchAll();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🧾 All SMS Transactions
        </Typography>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = "/"}
        >
          Back to Dashboard
        </Button>

        <Divider sx={{ my: 2 }} />

        {transactions.length === 0 ? (
          <Typography>No transactions found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {/* Debit Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1, color: "red" }}>🔻 Debit Transactions</Typography>
              <List>
                {transactions
                  .filter(txn => txn.type === "debit")
                  .map((txn, index) => (
                    <ListItem key={`debit-${index}`}>
                      <SmsIcon sx={{ color: "#EF5350", mr: 1 }} />
                      <ListItemText
                        primary={`$${txn.amount} at ${txn.vendor}`}
                        secondary={`📂 ${txn.category} | 🗓️ ${txn.date}`}
                      />
                    </ListItem>
                  ))}
              </List>
            </Grid>

            {/* Credit Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1, color: "green" }}>🔺 Credit Transactions</Typography>
              <List>
                {transactions
                  .filter(txn => txn.type === "credit")
                  .map((txn, index) => (
                    <ListItem key={`credit-${index}`}>
                      <SmsIcon sx={{ color: "#66BB6A", mr: 1 }} />
                      <ListItemText
                        primary={`$${txn.amount} from ${txn.vendor}`}
                        secondary={`📂 ${txn.category} | 🗓️ ${txn.date}`}
                      />
                    </ListItem>
                  ))}
              </List>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default AllTransactions;
