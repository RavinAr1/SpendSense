import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import AllTransactions from "./pages/AllTransactions";
import StockInsights from "./pages/StockInsights";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <div style={{ display: "flex" }}>
                <Sidebar />
                <div style={{ flexGrow: 1, padding: "20px" }}>
                  <Routes>
                    <Route path="home" element={<Home />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="insights" element={<Insights />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="transactions" element={<AllTransactions />} />
                    <Route path="stock-insights" element={<StockInsights />} />

                  </Routes>
                </div>
              </div>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
