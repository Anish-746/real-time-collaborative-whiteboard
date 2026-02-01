import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const TOOLS = {
  SELECT: 'select',
  PEN: 'pen',
  ERASER: 'eraser',
  TEXT: 'text',
  // Shapes
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ARROW: 'arrow',
  TRIANGLE: 'triangle',
  DIAMOND: 'diamond',
  STAR: 'star',
  LINE: 'line',
};

export const SHAPE_TOOLS = [
  TOOLS.RECTANGLE,
  TOOLS.CIRCLE,
  TOOLS.TRIANGLE,
  TOOLS.DIAMOND,
  TOOLS.STAR,
  TOOLS.LINE,
  TOOLS.ARROW,
];

export const useWhiteboard = () => {
  const [tool, setTool] = useState(TOOLS.PEN);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  
  // Style State
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // Canvas Transform State (Infinite Canvas)
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Selection State
  const [selectedId, setSelectedId] = useState(null);

  const isDrawing = useRef(false);
  const currentShapeId = useRef(null);

  // Helper to get pointer position relative to stage transform
  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointer);
  };
  
  const removeElement = (id) => {
      setElements(prev => prev.filter(el => el.id !== id));
      if (selectedId === id) setSelectedId(null);
  };
  
  const addTextElement = (text, x, y) => {
      const id = uuidv4();
      const newElement = {
          id,
          type: 'text',
          text,
          x,
          y,
          stroke: strokeColor,
          fontSize: 20 * (1/stageScale), // Adjust for scale or keep constant? Usually constant in world space.
          // For now, let's keep font size simpler.
          fill: strokeColor, // Text is filled with stroke color usually
      };
      setElements(prev => [...prev, newElement]);
  };

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    // If we are in select mode or Text mode, we might do different things
    if (tool === TOOLS.SELECT) {
      const clickedOn = e.target;
      if (clickedOn === stage) {
          setSelectedId(null);
      }
      return;
    }
    
    // If text tool, we hand off to Board to handle the input creation
    if (tool === TOOLS.TEXT) return;

    // Start Drawing
    isDrawing.current = true;
    const id = uuidv4();
    currentShapeId.current = id;

    let newElement;

    // Common props
    const baseProps = {
      id,
      stroke: tool === TOOLS.ERASER ? '#ffffff' : strokeColor,
      strokeWidth: tool === TOOLS.ERASER ? strokeWidth * 5 : strokeWidth, // Eraser larger by default, but scalable
      fill: tool === TOOLS.ERASER ? 'transparent' : fillColor,
    };

    if (tool === TOOLS.PEN || tool === TOOLS.ERASER) {
      newElement = {
        ...baseProps,
        type: 'line',
        points: [pos.x, pos.y],
        tool: tool,
      };
    } else if (tool === TOOLS.RECTANGLE) {
      newElement = {
        ...baseProps,
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
    } else if (tool === TOOLS.CIRCLE) {
      newElement = {
        ...baseProps,
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
      };
    } else if (tool === TOOLS.ARROW) {
      newElement = {
        ...baseProps,
        type: 'arrow',
        points: [pos.x, pos.y, pos.x, pos.y],
      };
    } else if (tool === TOOLS.TRIANGLE) {
      newElement = {
        ...baseProps,
        type: 'triangle',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
    } else if (tool === TOOLS.DIAMOND) {
      newElement = {
        ...baseProps,
        type: 'diamond',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
    } else if (tool === TOOLS.STAR) {
      newElement = {
        ...baseProps,
        type: 'star',
        x: pos.x,
        y: pos.y,
        outerRadius: 0,
        innerRadius: 0,
      };
    } else if (tool === TOOLS.LINE) {
      newElement = {
        ...baseProps,
        type: 'straightLine',
        points: [pos.x, pos.y, pos.x, pos.y],
      };
    }

    if (newElement) {
        setElements((prev) => [...prev, newElement]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || tool === TOOLS.SELECT || tool === TOOLS.TEXT) return;

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    
    setElements((prevElements) =>
      prevElements.map((el) => {
        if (el.id === currentShapeId.current) {
          if (tool === TOOLS.PEN || tool === TOOLS.ERASER) {
            return {
              ...el,
              points: [...el.points, pos.x, pos.y],
            };
          } else if (tool === TOOLS.RECTANGLE) {
            return {
              ...el,
              width: pos.x - el.x,
              height: pos.y - el.y,
            };
          } else if (tool === TOOLS.CIRCLE) {
            const dx = pos.x - el.x;
            const dy = pos.y - el.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            return {
              ...el,
              radius: radius,
            };
          } else if (tool === TOOLS.ARROW || tool === TOOLS.LINE) {
             const startX = el.points[0];
             const startY = el.points[1];
             return {
                 ...el,
                 points: [startX, startY, pos.x, pos.y]
             }
          } else if (tool === TOOLS.TRIANGLE || tool === TOOLS.DIAMOND) {
            return {
              ...el,
              width: pos.x - el.x,
              height: pos.y - el.y,
            };
          } else if (tool === TOOLS.STAR) {
            const dx = pos.x - el.x;
            const dy = pos.y - el.y;
            const outerRadius = Math.sqrt(dx * dx + dy * dy);
            return {
              ...el,
              outerRadius: outerRadius,
              innerRadius: outerRadius / 2,
            };
          }
        }
        return el;
      })
    );
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
        isDrawing.current = false;
        // Construct history here if needed
    }
    currentShapeId.current = null;
  };
  
  // Dragging Logic for Selection
  const handleDragEnd = (e, id) => {
     const { x, y } = e.target.position();
     setElements(prev => prev.map(el => {
         if (el.id === id) {
             return { ...el, x: x ? x : el.x, y: y ? y : el.y };
         }
         return el;
     }));
  };

  return {
    tool, setTool,
    elements, setElements,
    strokeColor, setStrokeColor,
    strokeWidth, setStrokeWidth,
    fillColor, setFillColor,
    selectedId, setSelectedId,
    stageScale, setStageScale,
    stagePos, setStagePos,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDragEnd,
    removeElement,
    addTextElement,
  };
};
