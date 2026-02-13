import { app } from "./app.js";
import { hocuspocus } from "./hocuspocus.js";
import { config } from "./config/index.js";
import { WebSocketServer } from "ws";

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    hocuspocus.handleConnection(ws, request);
  })
});
