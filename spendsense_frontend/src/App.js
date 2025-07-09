import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AllTransactions from "./pages/AllTransactions";
import StockInsights from "./pages/StockInsights";
import LoginPage from "./pages/LoginPage";

const SESSION_TIMEOUT = 5 * 60 * 1000;

function AppWrapper() {
  const isLoggedIn = localStorage.getItem("username");
  const location = useLocation();

  useEffect(() => {
    const checkSession = () => {
      const lastActivity = localStorage.getItem("lastActivity");
      const username = localStorage.getItem("username");
      if (username && lastActivity && Date.now() - lastActivity > SESSION_TIMEOUT) {
        localStorage.clear();
        window.location.href = "/";
      }
    };

    const interval = setInterval(checkSession, 60000);
    const updateActivity = () => localStorage.setItem("lastActivity", Date.now());

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);

    const syncLogout = (e) => {
      if (e.key === "username" && e.newValue === null) {
        window.location.href = "/";
      }
    };
    window.addEventListener("storage", syncLogout);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("storage", syncLogout);
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  const hideLayout = location.pathname === "/landing";

  return (
    <>
      {!hideLayout && <Navbar />}
      <div style={{ display: "flex" }}>
        {!hideLayout && <Sidebar />}
        <div style={{ flexGrow: 1, padding: "20px" }}>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<AllTransactions />} />
            <Route path="/insights" element={<StockInsights />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
