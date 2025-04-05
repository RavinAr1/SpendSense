import React from "react";
import { Container, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Box, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Home = () => {
  const navigate = useNavigate();

  return (

    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#E3F2FD", // Light blue background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        flexDirection: "column",
        py: 5,
      }}
    >


      <Container sx={{ textAlign: "center", mt: 5, zIndex: 2 }}>
        <Typography variant="h2" fontWeight="bold" color="black" gutterBottom>
          Welcome to SpendSense
        </Typography>
        <Typography variant="h5" color="black" paragraph>
          Track expenses, predict spending, and optimize savings with AI.
        </Typography>




        {/* Main Features Grid */}
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
          {[
            { title: "Dashboard", image: "/assets/dashboard.jpg", path: "/dashboard" },
            { title: "Stock Insights", image: "/assets/insights.jpg", path: "/insights" },
            { title: "SMS Transactions", image: "/assets/user.jpg", path: "/transactions" },
          ].map((pane) => (
            <Grid item key={pane.title} xs={12} sm={4}>
              <Card
                sx={{
                  maxWidth: 345,
                  borderRadius: 3,
                  backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker background for contrast
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 20px rgba(255, 255, 255, 0.1)",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.05)" }
                }}
              >
                <CardActionArea onClick={() => navigate(pane.path)}>
                  <CardMedia component="img" height="180" image={pane.image} alt={pane.title} />
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" color="white">
                      {pane.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>





        {/* Expandable Features Section */}
        <Accordion sx={{ mt: 5, maxWidth: "1130px", mx: "auto", textAlign: "left" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >


            <Typography variant="h6" fontWeight="bold">
              🔍 View Current & Upcoming Features
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" fontWeight="bold">✅ Features Currently Implemented:</Typography>


            <ul>
            <li><b>Real-Time Expense Tracking:</b> AI predicts spending trends, but real-time transaction tracking is not yet implemented.</li>
              <li><b>Personalized Budgeting Recommendations:</b> Fully implemented with AI-based spending category predictions and savings suggestions.</li>
              <li><b>Financial Goal Tracking:</b> Partially implemented. Savings recommendations exist, but tracking specific goals (e.g., "Save $5000 in 6 months") is not yet available.</li>
            </ul>



            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>❌ Features Not Yet Implemented:</Typography>
            <ul>
              <li><b>Investment Advisory:</b> Not implemented. Requires AI-driven investment suggestions and market data integration.</li>
              <li><b>Fraud Detection & Alerts:</b> Not implemented. Needs behavior-based anomaly detection for spending patterns.</li>
              <li><b>Chatbot Assistance:</b> Not implemented. Would require AI-based conversational assistance for financial queries.</li>
            </ul>

            

            <Typography variant="body2" sx={{ mt: 2 }}>
              🚀 Stay tuned for updates as we expand SpendSense with new AI-powered features!
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Container>
    </Box>
  );
};

export default Home;
