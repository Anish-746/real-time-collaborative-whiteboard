import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Star, RegularPolygon } from 'react-konva';
import { useWhiteboard, TOOLS, SHAPE_TOOLS } from './useWhiteboard';
import Toolbar from './Toolbar';

const Board = () => {
  const {
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
  } = useWhiteboard();

  // Ref to the Stage to export/download
  const stageRef = useRef(null);

  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Temporary text input state
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: '' });

  useEffect(() => {
    const checkSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Handle Download
  const handleDownload = () => {
    if (stageRef.current) {
        const uri = stageRef.current.toDataURL();
        const link = document.createElement('a');
        link.download = 'whiteboard.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  // Zoom Logic
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
  
  // Handle Stage Click for Text Tool
  const handleStageClick = (e) => {
      if (tool === TOOLS.TEXT) {
          const stage = e.target.getStage();
          const pointer = stage.getPointerPosition();
          
          setTextInput({
              visible: true,
              x: pointer.x,
              y: pointer.y,
              value: ''
          });
      }
  };

  const handleTextSubmit = () => {
      if (textInput.value.trim() !== '') {
          const stage = stageRef.current;
          const transform = stage.getAbsoluteTransform().copy();
          transform.invert();
          const pos = transform.point({ x: textInput.x, y: textInput.y });
          
          addTextElement(textInput.value, pos.x, pos.y);
      }
      setTextInput({ ...textInput, visible: false, value: '' });
      setTool(TOOLS.SELECT);
  };

  // Helper to compute diamond points
  const getDiamondPoints = (width, height) => {
    const hw = width / 2;
    const hh = height / 2;
    return [hw, 0, width, hh, hw, height, 0, hh];
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
      <Toolbar 
        activeTool={tool} 
        onSelectTool={setTool}
        onDownload={handleDownload}
        strokeColor={strokeColor} setStrokeColor={setStrokeColor}
        fillColor={fillColor} setFillColor={setFillColor}
        strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
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
        style={{ cursor: tool === TOOLS.SELECT ? 'default' : (tool === TOOLS.TEXT ? 'text' : 'crosshair') }}
      >
        <Layer>
          {elements.map((element) => {
            const isSelected = element.id === selectedId;
            const commonProps = {
                key: element.id,
                onClick: (e) => {
                    if (tool === TOOLS.ERASER) {
                        e.cancelBubble = true;
                        removeElement(element.id);
                    } else if (tool === TOOLS.SELECT) {
                        e.cancelBubble = true;
                        setSelectedId(element.id);
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
                onDragEnd: (e) => handleDragEnd(e, element.id),
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                fill: element.type !== 'line' && element.type !== 'arrow' && element.type !== 'straightLine' ? element.fill : undefined,
                shadowColor: 'blue',
                shadowBlur: isSelected ? 10 : 0,
                shadowOpacity: isSelected ? 0.6 : 0,
            };

            if (element.type === 'line') {
              return (
                <Line
                  {...commonProps}
                  points={element.points}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    element.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              );
            } else if (element.type === 'rect') {
              return (
                <Rect
                  {...commonProps}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                />
              );
            } else if (element.type === 'circle') {
              return (
                <Circle
                  {...commonProps}
                  x={element.x}
                  y={element.y}
                  radius={element.radius}
                />
              );
            } else if (element.type === 'arrow') {
                return (
                    <Arrow
                        {...commonProps}
                        points={element.points}
                        pointerLength={10}
                        pointerWidth={10}
                        fill={element.stroke}
                        stroke={element.stroke}
                    />
                );
            } else if (element.type === 'text') {
                return (
                    <Text
                        {...commonProps}
                        x={element.x}
                        y={element.y}
                        text={element.text}
                        fontSize={element.fontSize}
                        fill={element.stroke}
                    />
                );
            } else if (element.type === 'triangle') {
                // Use RegularPolygon with 3 sides
                const radius = Math.max(Math.abs(element.width), Math.abs(element.height)) / 2;
                return (
                    <RegularPolygon
                        {...commonProps}
                        x={element.x + element.width / 2}
                        y={element.y + element.height / 2}
                        sides={3}
                        radius={radius}
                    />
                );
            } else if (element.type === 'diamond') {
                // Use a closed Line for diamond shape
                const points = getDiamondPoints(element.width, element.height);
                return (
                    <Line
                        {...commonProps}
                        x={element.x}
                        y={element.y}
                        points={points}
                        closed={true}
                        fill={element.fill}
                    />
                );
            } else if (element.type === 'star') {
                return (
                    <Star
                        {...commonProps}
                        x={element.x}
                        y={element.y}
                        numPoints={5}
                        innerRadius={element.innerRadius}
                        outerRadius={element.outerRadius}
                    />
                );
            } else if (element.type === 'straightLine') {
                return (
                    <Line
                        {...commonProps}
                        points={element.points}
                        lineCap="round"
                    />
                );
            }
            return null;
          })}
        </Layer>
      </Stage>
      
      {/* Text Input Overlay */}
      {textInput.visible && (
          <textarea
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onBlur={handleTextSubmit}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSubmit();
                }
            }}
            autoFocus
            style={{
                position: 'absolute',
                top: textInput.y,
                left: textInput.x,
                border: '1px solid blue',
                margin: 0,
                padding: '4px',
                background: 'transparent',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                minWidth: '50px',
                fontSize: '20px',
                fontFamily: 'sans-serif',
                lineHeight: '1.2',
                color: strokeColor,
                zIndex: 1000
            }}
          />
      )}
    </div>
  );
};

export default Board;
