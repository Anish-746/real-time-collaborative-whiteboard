import React, { useEffect, useState, useRef, useContext } from "react";
import { Stage, Layer } from "react-konva";
import { useWhiteboard, TOOLS } from "../../hooks/useWhiteboard";
import Toolbar from "./Toolbar";
import ShapeRenderer from "./ShapeRenderer.jsx";
import WhiteboardContext from "../../context/WhiteboardContext.jsx";
import AuthContext from "../../context/AuthContext.jsx";
import CursorAwareness from "./CursorAwareness.jsx";

const getRandomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

const Board = ({ doc, provider }) => {
  const { user } = useContext(AuthContext);

  const {
    elements,
    selectedId,
    setSelectedId,
    stagePos,
    setStagePos,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDragMove,
    handleDragEnd,
    removeElement,
    addTextElement,
    undo,
    redo,
  } = useWhiteboard(doc);

  const { tool, stageScale, setStageScale, setTool, strokeColor } =
    useContext(WhiteboardContext);

  useEffect(() => {
    if (!provider || !user) return;

    const awareness = provider.awareness;

    // Setting user details
    awareness.setLocalStateField("user", {
      name: user.username || "Anonymous",
      color: getRandomColor(),
    });
  }, [provider, user]);

  const handleStagePointerMove = (e) => {
    handleMouseMove(e);

    if (!provider) return;

    const stage = e.target.getStage();
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point(stage.getPointerPosition());

    // Setting cursor details
    provider.awareness.setLocalStateField("cursor", { x: pos.x, y: pos.y });
  };

  const stageRef = useRef(null);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [textInput, setTextInput] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: "",
  });

  useEffect(() => {
    const checkSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const handleDownload = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement("a");
      link.download = "whiteboard.png";
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePos(newPos);
  };

  const handleStageClick = (e) => {
    if (tool === TOOLS.TEXT) {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      setTextInput({
        visible: true,
        x: pointer.x,
        y: pointer.y,
        value: "",
      });
    }
  };

  const handleTextSubmit = () => {
    if (textInput.value.trim() !== "") {
      const stage = stageRef.current;
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const pos = transform.point({ x: textInput.x, y: textInput.y });
      addTextElement(textInput.value, pos.x, pos.y);
    }
    setTextInput({ ...textInput, visible: false, value: "" });
    setTool(TOOLS.SELECT);
  };

  const getCursorStyle = () => {
    if (tool === TOOLS.SELECT) return "default";
    if (tool === TOOLS.TEXT) return "text";
    if (tool === TOOLS.ERASER) return "crosshair";
    return "crosshair";
  };

  return (
    <div className="relative w-full h-full bg-[#f0f0f0] overflow-hidden">
      <Toolbar onDownload={handleDownload} onUndo={undo} onRedo={redo} />

      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleStagePointerMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleStagePointerMove}
        onTouchEnd={handleMouseUp}
        onClick={handleStageClick}
        ref={stageRef}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        draggable={tool === TOOLS.SELECT && !selectedId}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        style={{ cursor: getCursorStyle() }}
      >
        <Layer>
          {elements.map((element) => (
            <ShapeRenderer
              key={element.id}
              element={element}
              isSelected={element.id === selectedId}
              tool={tool}
              setSelectedId={setSelectedId}
              removeElement={removeElement}
              handleDragMove={handleDragMove}
              handleDragEnd={handleDragEnd}
            />
          ))}

          <CursorAwareness provider={provider} />
        </Layer>
      </Stage>

      {/* Text Input Overlay */}
      {textInput.visible && (
        <textarea
          value={textInput.value}
          onChange={(e) =>
            setTextInput({ ...textInput, value: e.target.value })
          }
          onBlur={handleTextSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleTextSubmit();
            }
          }}
          autoFocus
          className="absolute m-0 p-1 min-w-12.5 bg-transparent border border-blue-600 outline-none resize-none overflow-hidden text-xl font-sans leading-tight z-1000"
          style={{
            top: textInput.y,
            left: textInput.x,
            color: strokeColor,
          }}
        />
      )}
    </div>
  );
};

export default Board;
