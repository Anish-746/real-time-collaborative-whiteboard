import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";

export default function Dashboard({ user, onLogout, onGoToProfile }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    isPublic: true,
    maxMembers: 10
  });

  // Dummy rooms data
  const [myRooms] = useState([
    {
      id: 1,
      name: "Creative Brainstorm",
      code: "ROOM123",
      members: 5,
      maxMembers: 10,
      isPublic: true,
      owner: true,
      createdAt: "2 days ago"
    },
    {
      id: 2,
      name: "Art Collaboration",
      code: "ART456",
      members: 3,
      maxMembers: 8,
      isPublic: false,
      owner: true,
      createdAt: "1 week ago"
    }
  ]);

  const [publicRooms] = useState([
    {
      id: 3,
      name: "Sketch Party 🎨",
      code: "SKETCH01",
      members: 8,
      maxMembers: 15,
      isPublic: true,
      owner: false,
      host: "Sarah K."
    },
    {
      id: 4,
      name: "Design Workshop",
      code: "DESIGN22",
      members: 12,
      maxMembers: 20,
      isPublic: true,
      owner: false,
      host: "Mike R."
    },
    {
      id: 5,
      name: "Digital Art Hub",
      code: "DIGI789",
      members: 6,
      maxMembers: 12,
      isPublic: true,
      owner: false,
      host: "Emma L."
    }
  ]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    // Generate random room code
    const code = 'ROOM' + Math.random().toString(36).substring(2, 8).toUpperCase();
    alert(`Room "${newRoom.name}" created successfully!\nRoom Code: ${code}`);
    setShowCreateModal(false);
    setNewRoom({ name: "", description: "", isPublic: true, maxMembers: 10 });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      alert(`Joining room with code: ${roomCode}`);
      setShowJoinModal(false);
      setRoomCode("");
    }
  };

  const handleQuickJoin = (code) => {
    alert(`Joining room: ${code}`);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000] mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 font-['Comic_Sans_MS',_cursive]">
                Studio Dashboard 🎨
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || "Creative Artist"}!
              </p>
            </div>
            <div className="flex gap-3">
              {onGoToProfile && (
                <button
                  onClick={onGoToProfile}
                  className="px-4 py-2 bg-white border-2 border-black rounded-lg hover:bg-gray-50 active:scale-95 transition-all shadow-[3px_3px_0_#000]"
                >
                  View Profile 👤
                </button>
              )}
              <button
                onClick={onLogout}
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
            className="bg-gradient-to-br from-pink-100 to-purple-100 border-3 border-black rounded-2xl p-8 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 transition-all text-left group"
          >
            <div className="text-5xl mb-3">🎨</div>
            <h3 className="text-2xl font-bold mb-2 font-['Comic_Sans_MS',_cursive]">
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
            className="bg-gradient-to-br from-yellow-100 to-orange-100 border-3 border-black rounded-2xl p-8 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-y-1 transition-all text-left group"
          >
            <div className="text-5xl mb-3">🚪</div>
            <h3 className="text-2xl font-bold mb-2 font-['Comic_Sans_MS',_cursive]">
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
          <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',_cursive]">
            My Rooms ({myRooms.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRooms.map((room) => (
              <div
                key={room.id}
                className="border-2 border-black rounded-xl p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-[4px_4px_0_#000] transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{room.name}</h3>
                    <p className="text-sm text-gray-600">
                      Code: <span className="font-mono font-bold">{room.code}</span>
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-200 border-2 border-black rounded-lg text-xs font-bold">
                    OWNER
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-700">
                  <span>👥 {room.members}/{room.maxMembers} members</span>
                  <span>🔒 {room.isPublic ? "Public" : "Private"}</span>
                </div>

                <p className="text-xs text-gray-500 mb-3">Created {room.createdAt}</p>

                <div className="flex gap-2">
                  <button className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all">
                    Enter Room
                  </button>
                  <button className="px-4 py-2 bg-white border-2 border-black rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all">
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Rooms */}
        <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000]">
          <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',_cursive]">
            Browse Public Rooms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {publicRooms.map((room) => (
              <div
                key={room.id}
                className="border-2 border-black rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-[4px_4px_0_#000] transition-all"
              >
                <h3 className="font-bold text-lg mb-2">{room.name}</h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  Host: <span className="font-medium">{room.host}</span>
                </p>

                <div className="flex items-center gap-3 mb-3 text-sm text-gray-700">
                  <span>👥 {room.members}/{room.maxMembers}</span>
                </div>

                <button
                  onClick={() => handleQuickJoin(room.code)}
                  className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 active:scale-95 transition-all shadow-[3px_3px_0_#047857]"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000] w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',_cursive]">
                Create New Room 🎨
              </h2>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="Creative Studio"
                    className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="What's this room about?"
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Members
                  </label>
                  <input
                    type="number"
                    value={newRoom.maxMembers}
                    onChange={(e) => setNewRoom({ ...newRoom, maxMembers: parseInt(e.target.value) })}
                    min="2"
                    max="50"
                    className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newRoom.isPublic}
                    onChange={(e) => setNewRoom({ ...newRoom, isPublic: e.target.checked })}
                    className="w-5 h-5 border-2 border-black rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Make this room public
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    Create Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0_#000] w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',_cursive]">
                Join Room 🚪
              </h2>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ROOM123"
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-lg text-center tracking-wider"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ask the room owner for the code
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    Join Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-6 py-3 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}