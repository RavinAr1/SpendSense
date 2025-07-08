import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  MenuItem, Select, FormControl, InputLabel, Typography,
  Container, Paper, CircularProgress, Box, TextField,
  Button, Divider, Collapse, IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement, PointElement, CategoryScale,
  LinearScale, Tooltip, Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const StockInsights = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

  const [stockAdvice, setStockAdvice] = useState("");
  const [viewMode, setViewMode] = useState("forecast");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/stock_forecast?symbol=${selectedSymbol}`);
      setForecastData(res.data.forecast || []);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol]);

  const fetchAdvice = useCallback(async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/stock_advice?symbol=${selectedSymbol}`);
      setStockAdvice(res.data.advice || "No insight available.");
    } catch (err) {
      console.error("Error fetching stock advice:", err);
      setStockAdvice("Could not generate insight.");
    }
  }, [selectedSymbol]);

  useEffect(() => {
    fetchForecast();
    fetchAdvice();
  }, [fetchForecast, fetchAdvice]);

  const prepareChartData = () => {
    let dataToDisplay = forecastData;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      dataToDisplay = forecastData.filter((item) => {
        const date = new Date(item.Date || item.ds);
        return date >= start && date <= end;
      });
    } else if (viewMode === "forecast") {
      dataToDisplay = forecastData.slice(-30);
    }

    const labels = dataToDisplay.map((item) => item.Date || item.ds);
    const predicted = dataToDisplay.map((item) => Number(item.Predicted_Close));

    const datasets = [
      {
        label: "Predicted Close",
        data: predicted,
        borderColor: "#42A5F5",
        fill: false,
        tension: 0.4
      }
    ];

    if ("Upper_Bound" in dataToDisplay[0] && "Lower_Bound" in dataToDisplay[0]) {
      const upper = dataToDisplay.map((item) => Number(item.Upper_Bound));
      const lower = dataToDisplay.map((item) => Number(item.Lower_Bound));

      datasets.push(
        {
          label: "Upper Bound",
          data: upper,
          borderColor: "rgba(76, 175, 80, 0.5)",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4
        },
        {
          label: "Lower Bound",
          data: lower,
          borderColor: "rgba(244, 67, 54, 0.5)",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4
        }
      );
    }

    return { labels, datasets };
  };

  const handleChatSubmit = async () => {
    if (!chatInput) return;
    setChatLoading(true);
    setChatResponse("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/chatbot_qa", {
        message: chatInput
      });
      const raw = res.data.response || "No response generated.";
      const answer = raw.replace(/\*\*/g, "").replace(/\*/g, "•");
      setChatResponse(answer);

      setChatHistory((prev) => {
        const updated = [{ question: chatInput, answer }, ...prev];
        return updated.slice(0, 5);
      });
    } catch (err) {
      console.error("Error from GPT-style chatbot:", err);
      const fallback = "❌ Could not generate a response.";
      setChatResponse(fallback);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper elevation={5} sx={{ p: 4 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Stock</InputLabel>
          <Select
            value={selectedSymbol}
            onChange={(e) => {
              setSelectedSymbol(e.target.value);
              setStartDate(null);
              setEndDate(null);
            }}
          >
            <MenuItem value="AAPL">Apple (AAPL)</MenuItem>
            <MenuItem value="MSFT">Microsoft (MSFT)</MenuItem>
            <MenuItem value="GOOGL">Google (GOOGL)</MenuItem>
            <MenuItem value="AMZN">Amazon (AMZN)</MenuItem>
            <MenuItem value="TSLA">Tesla (TSLA)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <MenuItem value="forecast">Forecast Only (Last 30 Days)</MenuItem>
            <MenuItem value="full">Full Forecast Range</MenuItem>
          </Select>
        </FormControl>

        <Box display="flex" gap={2} sx={{ mb: 3 }}>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" dateFormat="yyyy-MM-dd" />
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} minDate={startDate} placeholderText="End Date" dateFormat="yyyy-MM-dd" />
        </Box>

        <Typography variant="h4" gutterBottom>
          📈 Stock Price Forecast ({selectedSymbol})
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Line data={prepareChartData()} />
            <Typography variant="h6" sx={{ mt: 4 }}>
              💡 AI Insight:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {stockAdvice}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom>
          🤖 Ask StockBot
        </Typography>

        <Box display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Ask me anything (e.g. Which is better, AAPL or TSLA?)"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
          />
          <Button variant="contained" onClick={handleChatSubmit} disabled={chatLoading}>
            Ask
          </Button>
        </Box>

        {chatLoading ? (
          <Typography color="text.secondary">Thinking...</Typography>
        ) : (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 3 }}>
            {chatResponse}
          </Typography>
        )}

        {chatHistory.length > 0 && (
          <Box>
            <Box display="flex" alignItems="center" sx={{ cursor: "pointer" }} onClick={() => setHistoryOpen(!historyOpen)}>
              <Typography variant="subtitle2" color="text.secondary">
                {historyOpen ? "🔽 Hide Chat History" : "▶️ Show Last 5 Questions & Answers"}
              </Typography>
              <IconButton size="small">
                {historyOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={historyOpen}>
              <Box sx={{ mt: 2 }}>
                {chatHistory.map((entry, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">🗨️ {entry.question}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{entry.answer}</Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default StockInsights;
