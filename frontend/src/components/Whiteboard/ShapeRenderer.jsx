import React from "react";
import {
  Line,
  Rect,
  Circle,
  Arrow,
  Text,
  Star,
  RegularPolygon,
} from "react-konva";
import { TOOLS } from "../../hooks/useWhiteboard";

const getDiamondPoints = (width, height) => {
  const hw = width / 2;
  const hh = height / 2;
  return [hw, 0, width, hh, hw, height, 0, hh];
};

const ShapeRenderer = ({
  element,
  isSelected,
  tool,
  setSelectedId,
  removeElement,
  handleDragMove,
  handleDragEnd,
}) => {
  const commonProps = {
    onMouseDown: (e) => {
      if (tool === TOOLS.ERASER) {
        e.cancelBubble = true;
        removeElement(element.id);
      } else if (tool === TOOLS.SELECT) {
        e.cancelBubble = true;
        setSelectedId(element.id);
      }
    },

    onMouseEnter: (e) => {
      if (tool === TOOLS.ERASER && e.evt.buttons === 1) {
        removeElement(element.id);
      }
    },

    onTap: (e) => {
      if (tool === TOOLS.ERASER) {
        e.cancelBubble = true;
        removeElement(element.id);
      } else if (tool === TOOLS.SELECT) {
        e.cancelBubble = true;
        setSelectedId(element.id);
      }
    },

    draggable: tool === TOOLS.SELECT,
    onDragMove: (e) => handleDragMove(e, element.id),
    onDragEnd: (e) => handleDragEnd(e, element.id),
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
    hitStrokeWidth: tool === TOOLS.ERASER ? 30 : Math.max(element.strokeWidth || 0, 15),
    shadowColor: "#4a90e2",
    shadowBlur: isSelected ? 10 : 0,
    shadowOpacity: isSelected ? 0.6 : 0,
  };

  switch (element.type) {
    case "line":
      return (
        <Line
          {...commonProps}
          x={element.x || 0}
          y={element.y || 0}
          points={element.points}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
        />
      );

    case "rect":
      return (
        <Rect
          {...commonProps}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={element.fill}
        />
      );

    case "circle":
      return (
        <Circle
          {...commonProps}
          x={element.x}
          y={element.y}
          radius={element.radius}
          fill={element.fill}
        />
      );

    case "arrow":
      return (
        <Arrow
          {...commonProps}
          x={element.x || 0}
          y={element.y || 0}
          points={element.points}
          pointerLength={10}
          pointerWidth={10}
          fill={element.stroke}
          stroke={element.stroke}
        />
      );

    case "text":
      return (
        <Text
          {...commonProps}
          stroke={null}
          strokeWidth={null}
          x={element.x}
          y={element.y}
          text={element.text}
          fontSize={element.fontSize}
          fill={element.stroke}
        />
      );

    case "triangle": {
      const radius =
        Math.max(Math.abs(element.width), Math.abs(element.height)) / 2;

      return (
        <RegularPolygon
          {...commonProps}
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          sides={3}
          radius={radius}
          fill={element.fill}
        />
      );
    }

    case "diamond":
      return (
        <Line
          {...commonProps}
          x={element.x}
          y={element.y}
          points={getDiamondPoints(element.width, element.height)}
          closed
          fill={element.fill}
        />
      );

    case "star":
      return (
        <Star
          {...commonProps}
          x={element.x}
          y={element.y}
          numPoints={5}
          innerRadius={element.innerRadius}
          outerRadius={element.outerRadius}
          fill={element.fill}
        />
      );

    case "straightLine":
      return (
        <Line
          {...commonProps}
          x={element.x || 0}
          y={element.y || 0}
          points={element.points}
          lineCap="round"
        />
      );

    default:
      return null;
  }
};

export default React.memo(ShapeRenderer);
