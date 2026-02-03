import { useState, useRef, useEffect } from "react";
import * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";

export const TOOLS = {
  SELECT: "select",
  PEN: "pen",
  ERASER: "eraser",
  TEXT: "text",
  // Shapes
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ARROW: "arrow",
  TRIANGLE: "triangle",
  DIAMOND: "diamond",
  STAR: "star",
  LINE: "line",
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

export const useWhiteboard = (doc) => {
  const [tool, setTool] = useState(TOOLS.PEN);

  const [elements, setElements] = useState([]);

  // Style State
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);

  // Canvas Transform State
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Selection State
  const [selectedId, setSelectedId] = useState(null);

  const isDrawing = useRef(false);
  const currentShapeId = useRef(null);

  // --- YJS SYNC LOGIC ---
  useEffect(() => {
    if (!doc) return;

    const yElements = doc.getArray("elements");

    // 1. Initial Load
    setElements(yElements.toArray());

    // 2. Listen for remote changes
    const observer = () => {
      setElements(yElements.toArray());
    };

    yElements.observe(observer);

    return () => yElements.unobserve(observer);
  }, [doc]);

  // Helper to update a specific element in Yjs
  const updateElementInYjs = (id, updates) => {
    if (!doc) return;
    const yElements = doc.getArray("elements");

    // Yjs arrays are not indexed by ID, so we find the index
    // Note: For 1000+ items, a Y.Map is better, but Array is fine for now
    let index = -1;
    const currentArray = yElements.toArray();
    for (let i = 0; i < currentArray.length; i++) {
      if (currentArray[i].id === id) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      // We must delete and re-insert to update object in Y.Array
      // Or use Y.Map for elements if we want property-level granularity
      const existing = currentArray[index];
      const updated = { ...existing, ...updates };

      doc.transact(() => {
        yElements.delete(index, 1);
        yElements.insert(index, [updated]);
      });
    }
  };

  // Helper to add element
  const addElementToYjs = (element) => {
    if (!doc) return;
    doc.getArray("elements").push([element]);
  };

  // Helper to remove element
  const removeElementFromYjs = (id) => {
    if (!doc) return;
    const yElements = doc.getArray("elements");
    const index = yElements.toArray().findIndex((el) => el.id === id);
    if (index !== -1) {
      yElements.delete(index, 1);
    }
  };

  // Helper to get pointer position relative to stage transform
  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointer);
  };

  const removeElement = (id) => {
    removeElementFromYjs(id);
    if (selectedId === id) setSelectedId(null);
  };

  const addTextElement = (text, x, y) => {
    const id = uuidv4();
    const newElement = {
      id,
      type: "text",
      text,
      x,
      y,
      stroke: strokeColor,
      fontSize: 20, // Fixed font size, scaling handled by Stage
      fill: strokeColor,
    };
    addElementToYjs(newElement);
  };

  const handleMouseDown = (e) => {
    if (!doc) return;
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    // 1. SELECT Tool Logic
    if (tool === TOOLS.SELECT) {
      const clickedOn = e.target;
      if (clickedOn === stage) {
        setSelectedId(null);
      }
      return;
    }

    // 2. ERASER & TEXT Logic
    // Eraser is handled via interactions on the shapes themselves (in Board.jsx),
    // Text is handled via interactions on the board click (in Board.jsx).
    if (tool === TOOLS.TEXT || tool === TOOLS.ERASER) return;

    // 3. DRAWING Logic (Shapes & Pen)
    isDrawing.current = true;
    const id = uuidv4();
    currentShapeId.current = id;

    const baseProps = {
      id,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      fill: fillColor,
    };

    let newElement = null;

    if (tool === TOOLS.PEN) {
      newElement = {
        ...baseProps,
        type: "line",
        points: [pos.x, pos.y],
        tool: tool,
      };
    } else if (tool === TOOLS.RECTANGLE) {
      newElement = {
        ...baseProps,
        type: "rect",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
    } else if (tool === TOOLS.CIRCLE) {
      newElement = {
        ...baseProps,
        type: "circle",
        x: pos.x,
        y: pos.y,
        radius: 0,
      };
    } else if (tool === TOOLS.ARROW) {
      newElement = {
        ...baseProps,
        type: "arrow",
        points: [pos.x, pos.y, pos.x, pos.y],
      };
    } else if (tool === TOOLS.TRIANGLE) {
      newElement = {
        ...baseProps,
        type: "triangle",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
    } else if (tool === TOOLS.DIAMOND) {
      newElement = {
        ...baseProps,
        type: "diamond",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
      };
    } else if (tool === TOOLS.STAR) {
      newElement = {
        ...baseProps,
        type: "star",
        x: pos.x,
        y: pos.y,
        outerRadius: 0,
        innerRadius: 0,
      };
    } else if (tool === TOOLS.LINE) {
      newElement = {
        ...baseProps,
        type: "straightLine",
        points: [pos.x, pos.y, pos.x, pos.y],
      };
    }

    if (newElement) {
      addElementToYjs(newElement);
    }
  };

  const handleMouseMove = (e) => {
    // Stop if not drawing or if tool is passive (Select, Text, Eraser)
    if (
      !isDrawing.current ||
      tool === TOOLS.SELECT ||
      tool === TOOLS.TEXT ||
      tool === TOOLS.ERASER ||
      !doc
    )
      return;

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    const yElements = doc.getArray("elements");
    const arr = yElements.toArray();
    const index = arr.findIndex((el) => el.id === currentShapeId.current);

    if (index === -1) return;

    const el = arr[index];
    let updatedEl = null;

    if (tool === TOOLS.PEN) {
      updatedEl = {
        ...el,
        points: [...el.points, pos.x, pos.y],
      };
    } else if (tool === TOOLS.RECTANGLE) {
      updatedEl = {
        ...el,
        width: pos.x - el.x,
        height: pos.y - el.y,
      };
    } else if (tool === TOOLS.CIRCLE) {
      const dx = pos.x - el.x;
      const dy = pos.y - el.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      updatedEl = {
        ...el,
        radius: radius,
      };
    } else if (tool === TOOLS.ARROW || tool === TOOLS.LINE) {
      const startX = el.points[0];
      const startY = el.points[1];
      updatedEl = {
        ...el,
        points: [startX, startY, pos.x, pos.y],
      };
    } else if (tool === TOOLS.TRIANGLE || tool === TOOLS.DIAMOND) {
      updatedEl = {
        ...el,
        width: pos.x - el.x,
        height: pos.y - el.y,
      };
    } else if (tool === TOOLS.STAR) {
      const dx = pos.x - el.x;
      const dy = pos.y - el.y;
      const outerRadius = Math.sqrt(dx * dx + dy * dy);
      updatedEl = {
        ...el,
        outerRadius: outerRadius,
        innerRadius: outerRadius / 2,
      };
    }

    if (updatedEl) {
      // Optimization: For mouse move, we often don't want to create a million history steps
      // But for Yjs synchronization, we usually just replace the item.
      doc.transact(() => {
        yElements.delete(index, 1);
        yElements.insert(index, [updatedEl]);
      }, "move"); // 'move' origin can be used to filter local updates if needed
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
    }
    currentShapeId.current = null;
  };

  // Dragging Logic for Selection
  const handleDragEnd = (e, id) => {
    // Prevent updating state if we just erased the object (edge case)
    if (tool === TOOLS.ERASER) return;

    const { x, y } = e.target.position();
    updateElementInYjs(id, { x, y });
  };

  return {
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
  };
};
