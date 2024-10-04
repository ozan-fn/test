import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(express.static(path.join(__dirname, "../../dist")));

app.get("/api", (req, res) => {
  try {
    const v = req.query.v;
    if (!v) {
      res.sendStatus(400);
      return;
    }
    io.emit("v", v);
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
