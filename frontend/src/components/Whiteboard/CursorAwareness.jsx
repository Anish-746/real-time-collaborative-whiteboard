import React, { useEffect, useState } from "react";
import { Group, Path, Rect, Text } from "react-konva";

const CursorAwareness = React.memo(({ provider }) => {
  const [remoteCursors, setRemoteCursors] = useState({});

  useEffect(() => {
    if (!provider) return;
    const awareness = provider.awareness;

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const cursors = {};

      states.forEach((state, clientId) => {
        if (clientId === awareness.clientID) return;
        if (state.cursor) {
          cursors[clientId] = {
            x: state.cursor.x,
            y: state.cursor.y,
            user: state.user || { name: "Guest", color: "#000" },
          };
        }
      });
      setRemoteCursors(cursors);
    };

    awareness.on("change", handleAwarenessChange);
    return () => awareness.off("change", handleAwarenessChange);
  }, [provider]);

  return (
    <>
      {Object.entries(remoteCursors).map(([clientId, cursor]) => (
        <Group key={clientId} x={cursor.x} y={cursor.y} listening={false}>
          <Path
            data="M0 0L12.5 27.5L16.5 17L27.5 16.5L0 0Z"
            fill={cursor.user.color}
            stroke="white"
            strokeWidth={1}
          />
          <Text
            text={cursor.user.name}
            x={15}
            y={20}
            fontSize={14}
            fill="white"
          />
          <Rect
            x={12}
            y={18}
            width={cursor.user.name.length * 8 + 10}
            height={20}
            fill={cursor.user.color}
            cornerRadius={4}
            opacity={0.8}
            listening={false}
          />
          <Text
            text={cursor.user.name}
            x={17}
            y={22}
            fontSize={12}
            fill="white"
            listening={false}
          />
        </Group>
      ))}
    </>
  );
});

export default CursorAwareness;
