import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer } from "react-konva";
import { useWhiteboard, TOOLS } from "../../hooks/useWhiteboard";
import Toolbar from "./Toolbar";
import ShapeRenderer from "./ShapeRenderer.jsx";

const Board = ({ doc }) => {
  const {
    tool,
    setTool,
    elements,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    fillColor,
    setFillColor,
    selectedId,
    setSelectedId,
    stageScale,
    setStageScale,
    stagePos,
    setStagePos,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDragEnd,
    removeElement,
    addTextElement,
  } = useWhiteboard(doc);

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

  // Determine cursor style
  const getCursorStyle = () => {
    if (tool === TOOLS.SELECT) return "default";
    if (tool === TOOLS.TEXT) return "text";
    if (tool === TOOLS.ERASER) return "crosshair"; // or 'not-allowed'
    return "crosshair";
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#f0f0f0",
        overflow: "hidden",
      }}
    >
      <Toolbar
        activeTool={tool}
        onSelectTool={setTool}
        onDownload={handleDownload}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />

      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
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
              handleDragEnd={handleDragEnd}
            />
          ))}
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
          style={{
            position: "absolute",
            top: textInput.y,
            left: textInput.x,
            border: "1px solid blue",
            margin: 0,
            padding: "4px",
            background: "transparent",
            outline: "none",
            resize: "none",
            overflow: "hidden",
            minWidth: "50px",
            fontSize: "20px",
            fontFamily: "sans-serif",
            lineHeight: "1.2",
            color: strokeColor,
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
};

export default Board;
