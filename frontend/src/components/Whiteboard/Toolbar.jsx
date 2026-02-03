import React, { useState } from "react";
import {
  FaPen,
  FaEraser,
  FaMousePointer,
  FaDownload,
  FaPalette,
  FaFont,
  FaRegSquare,
  FaRegCircle,
  FaLongArrowAltRight,
  FaCaretDown,
  FaPlay,
  FaStar,
  FaMinus,
} from "react-icons/fa";
import { BsDiamond } from "react-icons/bs";
import { TOOLS, SHAPE_TOOLS } from "../../hooks/useWhiteboard";

const shapeIcons = {
  [TOOLS.RECTANGLE]: <FaRegSquare />,
  [TOOLS.CIRCLE]: <FaRegCircle />,
  [TOOLS.TRIANGLE]: <FaPlay style={{ transform: "rotate(-90deg)" }} />,
  [TOOLS.DIAMOND]: <BsDiamond />,
  [TOOLS.STAR]: <FaStar />,
  [TOOLS.LINE]: <FaMinus />,
  [TOOLS.ARROW]: <FaLongArrowAltRight />,
};

const shapeLabels = {
  [TOOLS.RECTANGLE]: "Rectangle",
  [TOOLS.CIRCLE]: "Circle",
  [TOOLS.TRIANGLE]: "Triangle",
  [TOOLS.DIAMOND]: "Diamond",
  [TOOLS.STAR]: "Star",
  [TOOLS.LINE]: "Line",
  [TOOLS.ARROW]: "Arrow",
};

const Toolbar = ({
  activeTool,
  onSelectTool,
  onDownload,
  strokeColor,
  setStrokeColor,
  fillColor,
  setFillColor,
  strokeWidth,
  setStrokeWidth,
}) => {
  const [showProperties, setShowProperties] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [selectedShape, setSelectedShape] = useState(TOOLS.RECTANGLE);

  const tools = [
    { id: TOOLS.SELECT, icon: <FaMousePointer />, label: "Select (V)" },
    { id: TOOLS.PEN, icon: <FaPen />, label: "Pen (P)" },
    { id: TOOLS.ERASER, icon: <FaEraser />, label: "Eraser (E)" },
    { id: TOOLS.TEXT, icon: <FaFont />, label: "Text (T)" },
  ];

  const colors = [
    "#000000",
    "#df4b26",
    "#228b22",
    "#0000ff",
    "#ffa500",
    "#ffffff",
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "linear-gradient(135deg, rgba(60, 60, 90, 0.7), rgba(30, 30, 50, 0.8))",
          backdropFilter: "blur(20px) saturate(200%)",
          WebkitBackdropFilter: "blur(20px) saturate(200%)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          padding: "12px 24px",
          borderRadius: "20px",
          display: "flex",
          gap: "8px",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          zIndex: 100,
          alignItems: "center",
        }}
      >
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onSelectTool(t.id);
              setShowShapesMenu(false);
            }}
            style={{
              backgroundColor:
                activeTool === t.id ? "rgba(74, 144, 226, 0.8)" : "transparent",
              border: "none",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}

        {/* Shapes Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowShapesMenu(!showShapesMenu);
              if (!SHAPE_TOOLS.includes(activeTool)) {
                onSelectTool(selectedShape);
              }
            }}
            style={{
              backgroundColor: SHAPE_TOOLS.includes(activeTool)
                ? "rgba(74, 144, 226, 0.8)"
                : "transparent",
              border: "none",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              transition: "all 0.2s",
            }}
            title={`Shapes (${shapeLabels[selectedShape]})`}
          >
            {shapeIcons[selectedShape]}
            <FaCaretDown style={{ fontSize: "12px" }} />
          </button>

          {showShapesMenu && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                left: "50%",
                transform: "translateX(-50%)",
                background:
                  "linear-gradient(135deg, rgba(60, 60, 90, 0.95), rgba(30, 30, 50, 0.98))",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                padding: "8px",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "6px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                minWidth: "180px",
              }}
            >
              {SHAPE_TOOLS.map((shape) => (
                <button
                  key={shape}
                  onClick={() => {
                    setSelectedShape(shape);
                    onSelectTool(shape);
                    setShowShapesMenu(false);
                  }}
                  style={{
                    backgroundColor:
                      activeTool === shape
                        ? "rgba(74, 144, 226, 0.6)"
                        : "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  title={shapeLabels[shape]}
                >
                  {shapeIcons[shape]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "rgba(255,255,255,0.3)",
            margin: "0 5px",
          }}
        />

        {/* Properties Toggle */}
        <button
          onClick={() => setShowProperties(!showProperties)}
          style={{
            backgroundColor: showProperties
              ? "rgba(74, 144, 226, 0.5)"
              : "transparent",
            border: "none",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Styles"
        >
          <FaPalette />
        </button>

        {/* Download Button */}
        <button
          onClick={onDownload}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Download Canvas"
        >
          <FaDownload />
        </button>
      </div>

      {/* Properties Popup */}
      {showProperties && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(40, 40, 40, 0.9)",
            backdropFilter: "blur(10px)",
            padding: "15px",
            borderRadius: "12px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            zIndex: 99,
            minWidth: "200px",
          }}
        >
          {/* Stroke Color */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
                opacity: 0.8,
              }}
            >
              Stroke Color
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {colors.map((color) => (
                <div
                  key={color}
                  onClick={() => setStrokeColor(color)}
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: color,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      strokeColor === color
                        ? "2px solid white"
                        : "1px solid rgba(255,255,255,0.2)",
                    boxShadow:
                      strokeColor === color
                        ? "0 0 0 2px rgba(74, 144, 226, 0.5)"
                        : "none",
                  }}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                style={{
                  width: "20px",
                  height: "20px",
                  padding: 0,
                  border: "none",
                  background: "none",
                }}
              />
            </div>
          </div>

          {/* Fill Color */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
                opacity: 0.8,
              }}
            >
              Fill Color
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <div
                onClick={() => setFillColor("transparent")}
                style={{
                  width: "20px",
                  height: "20px",
                  background:
                    "conic-gradient(#eee 0 25%, white 0 50%, #eee 0 75%, white 0)",
                  backgroundSize: "10px 10px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    fillColor === "transparent"
                      ? "2px solid white"
                      : "1px solid rgba(255,255,255,0.2)",
                }}
                title="None"
              />
              {colors.map((color) => (
                <div
                  key={color + "_fill"}
                  onClick={() => setFillColor(color)}
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: color,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      fillColor === color
                        ? "2px solid white"
                        : "1px solid rgba(255,255,255,0.2)",
                    boxShadow:
                      fillColor === color
                        ? "0 0 0 2px rgba(74, 144, 226, 0.5)"
                        : "none",
                  }}
                />
              ))}
              <input
                type="color"
                value={fillColor === "transparent" ? "#ffffff" : fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                style={{
                  width: "20px",
                  height: "20px",
                  padding: 0,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                title="Custom Fill Color"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
                opacity: 0.8,
              }}
            >
              Stroke Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#4a90e2" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;
