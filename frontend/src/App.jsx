import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login"); // "login", "signup", "profile", "dashboard"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage("dashboard"); // Go to dashboard after login
  };

  const handleSignup = (userData) => {
    if (userData) {
      // User completed signup
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentPage("dashboard"); // Go to dashboard after signup
    } else {
      // User clicked "Login" link on signup page
      setCurrentPage("login");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage("login");
  };

  const goToSignup = () => {
    setCurrentPage("signup");
  };

  const goToLogin = () => {
    setCurrentPage("login");
  };

  const goToProfile = () => {
    setCurrentPage("profile");
  };

  const goToDashboard = () => {
    setCurrentPage("dashboard");
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        // Not logged in - show login or signup
        currentPage === "signup" ? (
          <Signup onSignup={handleSignup} />
        ) : (
          <Login onLogin={handleLogin} onGoToSignup={goToSignup} />
        )
      ) : (
        // Logged in - show dashboard or profile
        currentPage === "profile" ? (
          <Profile user={user} onLogout={handleLogout} onGoToDashboard={goToDashboard} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} onGoToProfile={goToProfile} />
        )
      )}
    </div>
  );
}