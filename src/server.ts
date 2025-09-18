import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import pollSocket from "./sockets/poll.socket";
import { setIO } from "./controllers/vote.controller";

const PORT = Number(process.env.PORT ?? 4000);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Setup sockets
pollSocket(io);
setIO(io); // inject socket into vote controller

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
