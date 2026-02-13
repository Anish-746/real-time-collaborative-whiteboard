import { useState } from "react";
import { getRoomDetailsAPI, joinRoomAPI } from "../services/room.js";
import { useNavigate } from "react-router-dom";

function JoinRoomModal({ showJoinModal, setShowJoinModal }) {
  const [step, setStep] = useState("code"); // "code" | "password"
  const [formData, setFormData] = useState({
    shortCode: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!showJoinModal) return null;

  const resetAndClose = () => {
    setShowJoinModal(false);
    setStep("code");
    setFormData({
      shortCode: "",
      password: "",
    });
    setError("");
  };

  const handleSuccess = (code) => {
    setShowJoinModal(false);
    setFormData({ shortCode: "", password: "" });
    setStep("code");
    setError("");
    navigate(`/room/${code}`, { state: { accessGranted: true } });
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await getRoomDetailsAPI(formData.shortCode);

      if (res.is_member) {
        handleSuccess(formData.shortCode);
      } else if (res.room.access_type === "protected") {
        setStep("password");
      } else {
        await joinRoomAPI(formData);
        handleSuccess(formData.shortCode);
      }
    } catch (error) {
      setError(error.message || "Room not found.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await joinRoomAPI(formData);
      handleSuccess(formData.shortCode);
    } catch (error) {
      setError(error.message || "Incorrect password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000] w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',cursive]">
          {step === "code" ? "Join Room 🚪" : "Enter Password 🔒"}
        </h2>

        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Room Code
              </label>
              <input
                autoFocus
                type="text"
                value={formData.shortCode}
                onChange={(e) =>
                  setFormData({ ...formData, shortCode: e.target.value })
                }
                placeholder="Room123"
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-lg text-center tracking-wider"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-3 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Room Password
              </label>
              <input
                autoFocus
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Room"}
              </button>
              <button
                type="button"
                onClick={() => setStep("code")}
                className="px-6 py-3 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default JoinRoomModal;
