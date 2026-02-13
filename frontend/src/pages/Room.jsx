import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Board from "../components/Whiteboard/Board";
import { useYjs } from "../hooks/useYjs";
import { WhiteboardProvider } from "../context/WhiteboardProvider.jsx";
import { getRoomDetailsAPI, joinRoomAPI } from "../services/room.js";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [status, setStatus] = useState(location.state?.accessGranted ? "joined" : "loading"); // "loading" | "password" | "joined" | "error"
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const checkRoomAccess = async () => {
      try {
        const data = await getRoomDetailsAPI(roomId);

        if (data.room.access_type === "public" || data.isMember) {
          await joinRoomAPI({ shortCode: roomId });
          setStatus("joined");
        } else if (data.room.access_type === "protected") {
          setStatus("password");
        }
      } catch (error) {
        setErrorMsg(
          error.message || "Room not found or access denied.",
        );
        setStatus("error");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    checkRoomAccess();
  }, [roomId, token, navigate]);

  const handleJoinWithPassword = async (e) => {
    e.preventDefault();
    try {
      await joinRoomAPI({ shortCode: roomId, password });
      setStatus("joined");
    } catch (error) {
      setErrorMsg(error.message || "Incorrect password.");
    }
  };

  const { doc, provider } = useYjs(status === "joined" ? roomId : null, token);
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fdfcf7]">
        <h2 className="text-xl font-bold animate-pulse font-['Comic_Sans_MS',cursive]">
          Entering Room... 🎨
        </h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fdfcf7] flex-col">
        <h2 className="text-2xl font-bold text-red-600 mb-2 font-['Comic_Sans_MS',cursive]">
          Oops! 🚫
        </h2>
        <p className="text-gray-600">{errorMsg}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (status === "password") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fdfcf7]">
        <div className="bg-white border-3 border-black rounded-2xl p-8 shadow-[8px_8px_0_#000] max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 font-['Comic_Sans_MS',cursive]">
            Protected Room 🔒
          </h2>
          <p className="mb-4 text-gray-600">
            Enter the password to access this creative space.
          </p>

          <form onSubmit={handleJoinWithPassword} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Room Password"
              className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all"
              >
                Join Room
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-white border-2 border-black rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <WhiteboardProvider>
      <Board doc={doc} provider={provider} />
    </WhiteboardProvider>
  );
};

export default Room;
