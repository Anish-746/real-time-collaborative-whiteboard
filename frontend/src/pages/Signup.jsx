import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";

export default function Signup({ onSignup }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email!");
      return;
    }

    // Successful signup
    setSuccess(true);
    
    setTimeout(() => {
      if (onSignup) {
        onSignup({
          name: formData.name,
          email: formData.email,
          username: formData.username
        });
      }
      alert("Account created successfully! Redirecting to profile...");
    }, 1000);
  };

  return (
    <AuthLayout>
      <div className="w-[450px] bg-white border-3 border-black rounded-2xl p-8 shadow-[8px_8px_0_#000] relative z-20 transform hover:shadow-[10px_10px_0_#000] hover:-translate-y-1 transition-all duration-200">
        <h2 className="text-3xl font-bold mb-2 font-['Comic_Sans_MS',_cursive]">
          Join Us! 🎨
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Start your creative journey today
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✓ Account created successfully!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              placeholder="@alexdraws"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-[4px_4px_0_#666]"
          >
            Create Account →
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onSignup) {
                onSignup(null); // Signal to go back to login
              }
            }}
            className="text-black font-bold underline hover:text-gray-700"
          >
            Login
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}