import { useEffect, useState } from 'react';
import * as Y from 'yjs';

export const useYjs = (roomId, token) => {
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    if (!roomId || !token) return;

    const ydoc = new Y.Doc();

    setDoc(ydoc);

    return () => {
      ydoc.destroy();
    };
  }, [roomId, token]);

  return { doc };
};