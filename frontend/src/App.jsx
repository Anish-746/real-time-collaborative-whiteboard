import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login"); // "login", "signup", "profile"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage("profile");
  };

  const handleSignup = (userData) => {
    if (userData) {
      // User completed signup
      setUser(userData);
      setIsLoggedIn(true);
      setCurrentPage("profile");
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

  return (
    <div className="App">
      {currentPage === "profile" && isLoggedIn ? (
        <Profile user={user} onLogout={handleLogout} />
      ) : currentPage === "signup" ? (
        <Signup onSignup={handleSignup} />
      ) : (
        <Login onLogin={handleLogin} onGoToSignup={goToSignup} />
      )}
    </div>
  );
}