import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Board from "../components/Whiteboard/Board"; 
import { useYjs } from "../hooks/useYjs";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  let token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const { doc } = useYjs(roomId, token);

  return (
    <Board doc={doc} />
  );
};

export default Room;
