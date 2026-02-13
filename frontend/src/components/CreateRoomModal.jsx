import { useState } from "react";
import { createRoomAPI } from "../services/room.js";
import { useNavigate } from "react-router-dom";

function CreateRoomModal({ showCreateModal, setShowCreateModal }) {
  const [newRoom, setNewRoom] = useState({
    name: "",
    maxUsers: 4,
    accessType: "public", // "public" | "protected" | "private"
    password: "abcd",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const resetAndClose = () => {
    setShowCreateModal(false);
    setNewRoom({
      name: "",
      maxUsers: 4,
      accessType: "public",
      password: "abcd",
    });
    setError("");
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const room = await createRoomAPI(newRoom);
      resetAndClose();
      navigate(`/room/${room.short_code}`)
    } catch (error) {
      setError(error.message || "Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000] w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',cursive]">
          Create New Room 🎨
        </h2>

        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room Name</label>
            <input
              type="text"
              value={newRoom.name}
              disabled={loading}
              onChange={(e) =>
                setNewRoom({ ...newRoom, name: e.target.value })
              }
              placeholder="Creative Studio"
              className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Members</label>
            <input
              type="number"
              value={newRoom.maxUsers}
              disabled={loading}
              onChange={(e) =>
                setNewRoom({
                  ...newRoom,
                  maxUsers: e.target.value,
                })
              }
              min="2"
              max="100"
              className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Room Access Type
            </label>
            <select
              value={newRoom.accessType}
              disabled={loading}
              onChange={(e) =>
                setNewRoom({ ...newRoom, accessType: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
              aria-label="Room type"
            >
              <option value="public">Public — Anyone can join</option>
              <option value="protected">Protected — Requires password</option>
              <option value="private">Private — Invite only</option>
            </select>
          </div>

          {newRoom.accessType === "protected" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={newRoom.password}
                disabled={loading}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, password: e.target.value })
                }
                placeholder="Enter password"
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                required
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={resetAndClose}
              className="px-6 py-3 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRoomModal;
