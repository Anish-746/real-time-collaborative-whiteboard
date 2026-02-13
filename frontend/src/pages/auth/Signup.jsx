import { useContext, useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useEffect } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if(user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout>
      <div className="w-112.5 bg-white border-3 border-black rounded-2xl p-8 shadow-[8px_8px_0_#000] relative z-20 transform hover:shadow-[10px_10px_0_#000] hover:-translate-y-1 transition-all duration-200">
        <h2 className="text-3xl text-black font-bold mb-2 font-['Comic_Sans_MS',cursive]">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="auth-input-label">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="auth-input-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="auth-input-label">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="@alexDraws"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div>
            <label className="auth-input-label">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="auth-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="auth-input-label">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"} // Toggle
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
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
          <Link
            to="/login"
            className="text-black font-bold underline hover:text-gray-700"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}