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
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box } from "@mui/material";




const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [enrichStatus, setEnrichStatus] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/all_sms_transactions");
      const allTxns = res.data.all_transactions || [];

      // Filter only those with parsed fields (skip unprocessed raw messages)
      const enriched = allTxns.filter(txn => txn.type && txn.amount && txn.date);
      setTransactions(enriched);
    } catch (err) {
      console.error("Failed to load transactions", err);
    }
  };

  const validateAnomaly = async (smsText) => {
    try {
      await axios.post("http://127.0.0.1:5000/validate_sms_anomaly", { text: smsText });
      alert("✅ SMS validated successfully!");
      fetchAll(); // Refresh
    } catch (err) {
      console.error("Validation failed", err);
      alert("❌ Failed to validate SMS.");
    }
  };





  const handleSyncAndEnrich = async () => {
    setEnrichStatus("🔄 Syncing SMS + Enriching anomalies...");
    try {
      const parseRes = await axios.get("http://127.0.0.1:5000/parse_sms_messages_gemini");
  
      if (
        !parseRes.data ||
        !parseRes.data.new_transactions ||
        parseRes.data.new_transactions.length === 0
      ) {
        alert("ℹ️ No new SMS transactions found.");
      }
  
      const enrichRes = await axios.post("http://127.0.0.1:5000/enrich_anomaly_sms_batch");
      setEnrichStatus(`✅ ${enrichRes.data.count} messages enriched`);
  
      await fetchAll(); // refresh transactions
    } catch (err) {
      console.error("Sync + Enrich failed", err);
      setEnrichStatus("❌ Sync + Enrich failed.");
    } finally {
      setTimeout(() => setEnrichStatus(""), 5000);
    }
  };
  










  const filteredTransactions = transactions.filter(txn => {
    if (filter === "debit") return txn.type === "debit";
    if (filter === "credit") return txn.type === "credit";
    if (filter === "anomaly") return txn.is_anomaly === true;
    return true;
  });

  // 🔢 Accurate counts
  const debitCount = transactions.filter(txn => txn.type === "debit").length;
  const creditCount = transactions.filter(txn => txn.type === "credit").length;
  const anomalyCount = transactions.filter(txn => txn.is_anomaly === true).length;
  const currentViewCount = filteredTransactions.length;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>


      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          🧾 All SMS Transactions
        </Typography>
        <Button
          size="small"
          variant="text"
          color="info"

          startIcon={<RefreshIcon />}
          onClick={fetchAll}
        >
          Refresh
        </Button>
      </Box>







        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.href = "/"}
        >
          Back to Dashboard
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* 🔘 Filters */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <Button variant={filter === "all" ? "contained" : "outlined"} onClick={() => setFilter("all")}>
            All ({currentViewCount})
          </Button>
          <Button variant={filter === "debit" ? "contained" : "outlined"} onClick={() => setFilter("debit")}>
            Debit ({debitCount})
          </Button>
          <Button variant={filter === "credit" ? "contained" : "outlined"} onClick={() => setFilter("credit")}>
            Credit ({creditCount})
          </Button>
          <Button variant={filter === "anomaly" ? "contained" : "outlined"} onClick={() => setFilter("anomaly")}>
            ⚠️ Anomalies ({anomalyCount})
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleSyncAndEnrich}
          >
            🔄 Sync + Enrich
          </Button>


          {enrichStatus && (
            <Typography variant="body2" sx={{ ml: 2 }}>
              {enrichStatus}
            </Typography>
          )}
        </div>

        {/* 🔄 No records */}
        {filteredTransactions.length === 0 ? (
          <Typography>No transactions found for selected filter.</Typography>
        ) : (
          <Grid container spacing={2}>
            {/* 🔻 Debit Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1, color: "red" }}>
                🔻 Debit Transactions
              </Typography>

              {filter === "debit" ? (
                // 🧾 Group by category
                Object.entries(
                  filteredTransactions.reduce((acc, txn) => {
                    const cat = txn.category || "Uncategorized";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(txn);
                    return acc;
                  }, {})
                ).map(([category, txns], catIndex) => (
                  <div key={catIndex}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: "bold", color: "#1976D2" }}>
                      📂 {category}
                    </Typography>
                    <List dense>
                      {txns.map((txn, index) => (
                        <ListItem key={`${category}-${index}`}>
                          <SmsIcon sx={{ color: txn.is_anomaly ? "#FF5722" : "#EF5350", mr: 1 }} />
                          <ListItemText
                            primary={
                              <>
                                {txn.is_anomaly && <span style={{ color: "red", fontWeight: "bold" }}>⚠️ </span>}
                                ${txn.amount} at {txn.vendor}
                              </>
                            }
                            secondary={`🗓️ ${txn.date}`}
                          />
                          {txn.is_anomaly && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => validateAnomaly(txn.text)}
                            >
                              ✅ Validate
                            </Button>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </div>
                ))
              ) : (
                <List>
                  {filteredTransactions
                    .filter(txn => txn.type === "debit")
                    .map((txn, index) => (
                      <ListItem key={`debit-${index}`}>
                        <SmsIcon sx={{ color: txn.is_anomaly ? "#FF5722" : "#EF5350", mr: 1 }} />
                        <ListItemText
                          primary={
                            <>
                              {txn.is_anomaly && <span style={{ color: "red", fontWeight: "bold" }}>⚠️ </span>}
                              ${txn.amount} at {txn.vendor}
                            </>
                          }
                          secondary={`📂 ${txn.category} | 🗓️ ${txn.date}`}
                        />
                        {txn.is_anomaly && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => validateAnomaly(txn.text)}
                          >
                            ✅ Validate
                          </Button>
                        )}
                      </ListItem>
                    ))}
                </List>
              )}
            </Grid>

            {/* 🔺 Credit Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1, color: "green" }}>
                🔺 Credit Transactions
              </Typography>
              <List>
                {filteredTransactions
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
