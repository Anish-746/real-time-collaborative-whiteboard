import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Dummy credentials
  const DUMMY_CREDENTIALS = {
    email: "alex.johnson@example.com",
    password: "password123"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate credentials
    if (email === DUMMY_CREDENTIALS.email && password === DUMMY_CREDENTIALS.password) {
      // Successful login
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({ email, name: "Alex Johnson" }));
      navigate("/"); // Navigate to dashboard
    } else {
      setError("Invalid email or password. Try: alex.johnson@example.com / password123");
    }
  };

  return (
    <AuthLayout>
      <div className="w-96 bg-white border-[3px] border-black rounded-2xl p-8 shadow-[8px_8px_0_#000] relative z-20 transform hover:shadow-[10px_10px_0_#000] hover:-translate-y-1 transition-all duration-200">
        <h2 className="text-3xl font-bold mb-2 font-[Comic_Sans_MS,cursive]">
          Welcome Back ✏️
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Sign in to continue your creative journey
        </p>

        {/* Demo Credentials Info */}
        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <p className="text-xs font-bold text-blue-800 mb-1">🔑 Demo Credentials:</p>
          <p className="text-xs text-blue-700">Email: alex.johnson@example.com</p>
          <p className="text-xs text-blue-700">Password: password123</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-[4px_4px_0_#666]"
          >
            Login →
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-black font-bold underline hover:text-gray-700">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}