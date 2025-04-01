import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";

const StockInsights = () => {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState("");

  const fetchStockInfo = async () => {
    setLoading(true);
    setError("");
    setStockData(null);

    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cvlfn7pr01qj3umd4bcgcvlfn7pr01qj3umd4bd0`
      );
      setStockData(response.data);
    } catch (err) {
      setError("Error fetching stock data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: "15px" }}>
        <Typography variant="h4" gutterBottom>
          📈 Stock Market Insights
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Stock Symbol (e.g., AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={fetchStockInfo}
            disabled={loading}
          >
            Fetch
          </Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        {stockData && (
          <List>
            <ListItem>
              <ListItemText primary={`📊 Current Price: $${stockData.c}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`🔼 High Today: $${stockData.h}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`🔽 Low Today: $${stockData.l}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`📅 Previous Close: $${stockData.pc}`} />
            </ListItem>
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default StockInsights;
