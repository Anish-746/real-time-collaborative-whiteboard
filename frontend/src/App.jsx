import { Route, Routes } from "react-router-dom";
import Board from "./components/Whiteboard/Board";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import ProtectedRoute from "./pages/auth/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Room from "./pages/Room.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;