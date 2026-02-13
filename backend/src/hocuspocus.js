import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { supabase } from "./database/index.js";
import { verifyToken } from "./utils/jwt.js";

// Helper: Convert Uint8Array to Bytea String
const toBytea = (uint8Array) => {
  return `\\x${Buffer.from(uint8Array).toString("hex")}`;
};

// Helper: Convert Bytea String to Uint8Array
const fromBytea = (bytea) => {
  const hex = bytea.startsWith("\\x") ? bytea.slice(2) : bytea;
  return new Uint8Array(Buffer.from(hex, "hex"));
};

export const hocuspocus = new Hocuspocus({
  //fetch and store after changes only which is also debounced
  debounce: 5000,
  maxDebounce: 60000,

  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        try {
          const { data, error } = await supabase
            .from("rooms")
            .select("document")
            .eq("short_code", documentName)
            .single();

          if (error && error.code !== "PGRST116") {
            // PGRST116 = not found
            console.error("Error fetching document:", error);
          }

          if (data && data.document) {
            return fromBytea(data.document);
          }

          return null;
        } catch (err) {
          console.error("Unexpected fetch error:", err);
          return null;
        }
      },

      store: async ({ documentName, state }) => {
        try {
          const byteaState = toBytea(state);

          const { error } = await supabase
            .from("rooms")
            .update({
              document: byteaState,
              updated_at: new Date().toISOString(),
            })
            .eq("short_code", documentName);

          if (error) {
            console.error("Error saving document:", error);
          } else {
            console.log(`Saved room: ${documentName}`);
          }
        } catch (err) {
          console.error("Unexpected store error:", err);
        }
      },
    }),
  ],

  async onAuthenticate(data) {
    const { token } = data;
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    try {
      const decoded = verifyToken(token);
      return {
        user: {
          id: decoded.userId,
        },
      };
    } catch (err) {
      throw new Error("Unauthorized: Invalid token");
    }
  },
});
