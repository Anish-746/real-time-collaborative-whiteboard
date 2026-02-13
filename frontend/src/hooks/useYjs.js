import { useEffect, useMemo, useState } from "react";

import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { IndexeddbPersistence } from "y-indexeddb";

export const useYjs = (roomId, token) => {
  const [doc] = useState(() => new Y.Doc());
  const [synced, setSynced] = useState(false);

  const provider = useMemo(() => {
    if (!roomId || !token) return null;

    return new HocuspocusProvider({
      url: `${import.meta.env.VITE_WS_URL || "ws://localhost:5000"}`,
      name: roomId,
      document: doc,
      token: token,

      onSynced: () => {
        setSynced(true);
        console.log(`Connected to room: ${roomId}`);
      },

      onClose: () => {
        setSynced(false);
      },
    });
  }, [roomId, token, doc]);

  useEffect(() => {
    return () => {
      if (provider) {
        provider.destroy();
      }
    };
  }, [provider]);

  // Offline Indexeddb persistence
  useEffect(() => {
    if (!roomId || !doc) return;

    const persistence = new IndexeddbPersistence(roomId, doc);

    persistence.on("synced", () => {
      console.log("Content loaded from local database");
    });

    return () => {
      persistence.destroy();
    };
  }, [roomId, doc]);

  return { doc, provider, synced };
};
