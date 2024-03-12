const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join room", (room) => {
    socket.join(room);
  });

  socket.on("chat message", (msg) => {
    io.to(msg.room).emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("call user", (data) => {
    io.to(data.to).emit("call user", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("accept call", (data) => {
    io.to(data.to).emit("call accepted", {
      signal: data.signal,
      from: data.from,
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
