import React, { useContext, useState } from "react";
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
  FaUndo,
  FaRedo,
} from "react-icons/fa";
import { BsDiamond } from "react-icons/bs";
import { TOOLS, SHAPE_TOOLS } from "../../hooks/useWhiteboard";
import WhiteboardContext from "../../context/WhiteboardContext.jsx";

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

const Toolbar = ({ onDownload, onUndo, onRedo }) => {
  const {
    tool,
    setTool,
    strokeColor,
    setStrokeColor,
    fillColor,
    setFillColor,
    strokeWidth,
    setStrokeWidth,
  } = useContext(WhiteboardContext);

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

  // Common button classes
  const btnClass = (isActive) =>
    `flex items-center justify-center p-2.5 rounded-lg text-white text-xl transition-all duration-200 border-none cursor-pointer hover:bg-white/10 ${
      isActive ? "bg-[#4a90e2cc]" : "bg-transparent"
    }`;

  return (
    <>
      {/* Main Toolbar */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 rounded-2xl z-50 bg-linear-to-br from-[#3c3c5ab3] to-[#1e1e32cc] backdrop-blur-xl backdrop-saturate-200 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTool(t.id);
              setShowShapesMenu(false);
            }}
            className={btnClass(tool === t.id)}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}

        {/* Shapes Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowShapesMenu(!showShapesMenu);
              if (!SHAPE_TOOLS.includes(tool)) {
                setTool(selectedShape);
              }
            }}
            className={`${btnClass(SHAPE_TOOLS.includes(tool))} gap-1`}
            title={`Shapes (${shapeLabels[selectedShape]})`}
          >
            {shapeIcons[selectedShape]}
            <FaCaretDown className="text-xs" />
          </button>

          {/* Shapes Menu Popup */}
          {showShapesMenu && (
            <div className="absolute top-12.5 left-1/2 -translate-x-1/2 grid grid-cols-4 gap-1.5 p-2 min-w-45 rounded-xl bg-linear-to-br from-[#3c3c5af2] to-[#1e1e32fa] backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {SHAPE_TOOLS.map((shape) => (
                <button
                  key={shape}
                  onClick={() => {
                    setSelectedShape(shape);
                    setTool(shape);
                    setShowShapesMenu(false);
                  }}
                  className={`flex items-center justify-center p-3 rounded-lg text-white text-lg transition-all duration-200 border-none cursor-pointer ${
                    tool === shape
                      ? "bg-[#4a90e2]/60"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  title={shapeLabels[shape]}
                >
                  {shapeIcons[shape]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/30 mx-1.5" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          className={btnClass(false)}
          title="Undo (Ctrl+Z)"
        >
          <FaUndo />
        </button>
        <button
          onClick={onRedo}
          className={btnClass(false)}
          title="Redo (Ctrl+Y)"
        >
          <FaRedo />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-white/30 mx-1.5" />

        {/* Properties Toggle */}
        <button
          onClick={() => setShowProperties(!showProperties)}
          className={btnClass(showProperties)}
          title="Styles"
        >
          <FaPalette />
        </button>

        {/* Download Button */}
        <button
          onClick={onDownload}
          className={btnClass(false)}
          title="Download Canvas"
        >
          <FaDownload />
        </button>
      </div>

      {/* Properties Popup */}
      {showProperties && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 flex flex-col gap-4 p-4 min-w-50 rounded-xl bg-[#282828]/90 backdrop-blur-md text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] z-49">
          {/* Stroke Color */}
          <div>
            <label className="block mb-2 text-xs opacity-80">
              Stroke Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <div
                  key={color}
                  onClick={() => setStrokeColor(color)}
                  className={`w-5 h-5 rounded-full cursor-pointer border ${
                    strokeColor === color
                      ? "border-2 border-white shadow-[0_0_0_2px_rgba(74,144,226,0.5)]"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Fill Color */}
          <div>
            <label className="block mb-2 text-xs opacity-80">Fill Color</label>
            <div className="flex gap-2 flex-wrap">
              <div
                onClick={() => setFillColor("transparent")}
                className={`w-5 h-5 rounded-full cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjUiIGhlaWdodD0iNSIgZmlsbD0iI2VlZSIvPjxyZWN0IHg9IjUiIHk9IjUiIHdpZHRoPSI1IiBoZWlnaHQ9IjUiIGZpbGw9IiNlZWUiLz48L3N2Zz4=')] bg-white bg-repeat border ${
                  fillColor === "transparent"
                    ? "border-2 border-white"
                    : "border-white/20"
                }`}
                title="None"
              />
              {colors.map((color) => (
                <div
                  key={color + "_fill"}
                  onClick={() => setFillColor(color)}
                  className={`w-5 h-5 rounded-full cursor-pointer border ${
                    fillColor === color
                      ? "border-2 border-white shadow-[0_0_0_2px_rgba(74,144,226,0.5)]"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={fillColor === "transparent" ? "#ffffff" : fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer"
                title="Custom Fill Color"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="block mb-2 text-xs opacity-80">
              Stroke Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="40"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-full accent-[#4a90e2] h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;
