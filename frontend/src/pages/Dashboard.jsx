import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthContext from "../context/AuthContext.jsx";
import CreateRoomModal from "../components/CreateRoomModal.jsx";
import JoinRoomModal from "../components/JoinRoomModal.jsx";
import { getMyRoomsAPI, getPublicRoomsAPI } from "../services/room.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [myRooms, setMyRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const getMyRooms = await getMyRoomsAPI();
      const getPublicRooms = await getPublicRoomsAPI();
      setMyRooms(getMyRooms);
      setPublicRooms(getPublicRooms);
    };
    fetchRooms();
  }, [setMyRooms, setPublicRooms]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleQuickJoin = (code) => {
    navigate(`/room/${code}`);
  };

  const handleEnterRoom = (code) => {
    navigate(`/room/${code}`);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000] mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 font-[Comic_Sans_MS,cursive]">
                Studio Dashboard 🎨
              </h1>
              <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-50 active:scale-95 transition-all shadow-[3px_3px_0_#000]"
              >
                View Profile 👤
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-50 active:scale-95 transition-all shadow-[3px_3px_0_#000]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Create Room Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-linear-to-br from-pink-100 to-purple-100 border-3 border-black rounded-2xl p-8 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 transition-all text-left group"
          >
            <div className="text-5xl mb-3">🎨</div>
            <h3 className="text-2xl font-bold mb-2 font-['Comic_Sans_MS',cursive]">
              Create New Room
            </h3>
            <p className="text-gray-700">
              Start a new creative space and invite collaborators
            </p>
            <div className="mt-4 text-black font-bold group-hover:translate-x-2 transition-transform inline-block">
              Get Started →
            </div>
          </button>

          {/* Join Room Card */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-linear-to-br from-yellow-100 to-orange-100 border-3 border-black rounded-2xl p-8 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 transition-all text-left group"
          >
            <div className="text-5xl mb-3">🚪</div>
            <h3 className="text-2xl font-bold mb-2 font-['Comic_Sans_MS',cursive]">
              Join with Code
            </h3>
            <p className="text-gray-700">
              Enter a room code to join an existing space
            </p>
            <div className="mt-4 text-black font-bold group-hover:translate-x-2 transition-transform inline-block">
              Enter Code →
            </div>
          </button>
        </div>

        {/* My Rooms */}
        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000] mb-6">
          <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',cursive]">
            My Rooms ({myRooms.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRooms.map((room) => (
              <div
                key={room.id}
                className="border-2 border-black rounded-xl p-4 bg-linear-to-br from-blue-50 to-cyan-50 hover:shadow-[4px_4px_0_#000] transition-all"
              >
                <div className="flex justify-between items-start mb-0.75">
                  <div className="ml-1">
                    <h3 className="font-bold text-lg">{room.name}</h3>
                    <div className="flex justify-between items-center gap-4 mb-3 text-sm text-gray-700">
                      <p className="text-sm text-gray-600">
                        Code:{" "}
                        <span className="font-mono font-bold">
                          {room.short_code}
                        </span>
                      </p>

                      <span>
                        🔒{" "}
                        {room.access_type[0].toUpperCase() +
                          room.access_type.substring(1)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-200 border-2 border-black rounded-lg text-xs font-bold">
                    {room.user_permission[0].toUpperCase() +
                      room.user_permission.substring(1)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEnterRoom(room.short_code)}
                    className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    Enter Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Rooms */}
        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000]">
          <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',cursive]">
            Browse Public Rooms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {publicRooms.map((room) => (
              <div
                key={room.id}
                className="border-2 border-black rounded-xl p-4 bg-linear-to-br from-green-50 to-emerald-50 hover:shadow-[4px_4px_0_#000] transition-all"
              >
                <h3 className="font-bold text-lg mb-2">{room.name}</h3>

                <button
                  onClick={() => handleQuickJoin(room.short_code)}
                  className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 active:scale-95 transition-all shadow-[3px_3px_0_#047857]"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </div>

        <CreateRoomModal
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
        />
        <JoinRoomModal
          showJoinModal={showJoinModal}
          setShowJoinModal={setShowJoinModal}
        />
      </div>
    </AuthLayout>
  );
}
