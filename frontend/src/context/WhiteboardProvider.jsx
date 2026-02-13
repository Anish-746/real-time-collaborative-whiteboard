import { useState } from "react";
import WhiteboardContext from "./WhiteboardContext.jsx";
import { TOOLS } from "../hooks/useWhiteboard.js";

export const WhiteboardProvider = ({ children }) => {
  const [tool, setTool] = useState(TOOLS.PEN);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const [stageScale, setStageScale] = useState(1);

  return (
    <WhiteboardContext.Provider
      value={{
        tool,
        setTool,
        strokeColor,
        setStrokeColor,
        fillColor,
        setFillColor,
        strokeWidth,
        setStrokeWidth,
        stageScale,
        setStageScale,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};
