import { useState, useRef, useEffect, useContext } from "react";
import * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";
import WhiteboardContext from "../context/WhiteboardContext.jsx";
import { useCallback } from "react";

export const TOOLS = {
  SELECT: "select",
  PEN: "pen",
  ERASER: "eraser",
  TEXT: "text",
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
  const { tool, strokeColor, fillColor, strokeWidth } =
    useContext(WhiteboardContext);

  const [elements, setElements] = useState([]);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);

  const isDrawing = useRef(false);
  const currentShapeId = useRef(null);
  const undoManager = useRef(null);

  // YJS SYNC LOGIC
  useEffect(() => {
    if (!doc) return;

    const yElements = doc.getMap("elements");

    if (!undoManager.current) {
      undoManager.current = new Y.UndoManager(yElements, {
        captureTimeout: 10000,
      });
    }

    const updateState = () => {
      const arr = Array.from(yElements.values());
      //sorting so that older items are on back and newer items are on top
      arr.sort((a, b) => a.createdAt - b.createdAt);
      setElements(arr);
    };

    updateState();

    const observer = () => {
      updateState();
    };

    yElements.observe(observer);

    return () => yElements.unobserve(observer);
  }, [doc]);

  const undo = useCallback(() => {
    undoManager.current?.undo();
  }, []);

  const redo = useCallback(() => {
    undoManager.current?.redo();
  }, []);

  const updateElementInYjs = useCallback(
    (id, updates) => {
      if (!doc) return;
      const yElements = doc.getMap("elements");

      const existing = yElements.get(id);

      if (existing) {
        const updated = { ...existing, ...updates };
        doc.transact(() => {
          yElements.set(id, updated);
        });
      }
    },
    [doc],
  );

  const addElementToYjs = (element) => {
    if (!doc) return;

    const newElement = { ...element, createdAt: Date.now() };
    doc.getMap("elements").set(element.id, newElement);
  };

  const removeElementFromYjs = useCallback(
    (id) => {
      if (!doc) return;

      doc.getMap("elements").delete(id);
    },
    [doc],
  );

  // Get pointer position relative to stage transform
  const getRelativePointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointer);
  };

  const removeElement = useCallback(
    (id) => {
      undoManager.current?.stopCapturing();
      removeElementFromYjs(id);
      undoManager.current?.stopCapturing();

      if (selectedId === id) setSelectedId(null);
    },
    [removeElementFromYjs, selectedId],
  );

  const addTextElement = (text, x, y) => {
    undoManager.current?.stopCapturing();
    const id = uuidv4();
    const newElement = {
      id,
      type: "text",
      text,
      x,
      y,
      stroke: strokeColor,
      fontSize: 20,
      fill: strokeColor,
    };
    addElementToYjs(newElement);
    undoManager.current?.stopCapturing();
  };

  const handleMouseDown = (e) => {
    if (!doc) return;

    //separate previous actions before starting new one
    undoManager.current?.stopCapturing();

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    if (tool === TOOLS.SELECT) {
      const clickedOn = e.target;
      if (clickedOn === stage) {
        setSelectedId(null);
      }
      return;
    } else if (selectedId) setSelectedId(null);

    if (tool === TOOLS.TEXT || tool === TOOLS.ERASER) return;

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

    const yElements = doc.getMap("elements");
    const el = yElements.get(currentShapeId.current);

    if (!el) return;

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
      doc.transact(() => {
        yElements.set(currentShapeId.current, updatedEl);
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;

      //close the current action sequence
      undoManager.current?.stopCapturing();
    }
    currentShapeId.current = null;
  };

  const handleDragMove = useCallback(
    (e, id) => {
      if (tool === TOOLS.ERASER) return;
      const { x, y } = e.target.position();
      updateElementInYjs(id, { x, y });
    },
    [updateElementInYjs, tool],
  );

  const handleDragEnd = useCallback(
    (e, id) => {
      if (tool === TOOLS.ERASER) return;

      undoManager.current?.stopCapturing();
      const { x, y } = e.target.position();
      updateElementInYjs(id, { x, y });
      undoManager.current?.stopCapturing();
    },
    [updateElementInYjs, tool],
  );

  return {
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
  };
};
