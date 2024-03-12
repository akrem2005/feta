// server.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("offer", ({ room, target, sdp }) => {
    socket.to(room).to(target).emit("offer", { room, sender: socket.id, sdp });
  });

  socket.on("answer", ({ room, target, sdp }) => {
    socket.to(room).to(target).emit("answer", { room, sender: socket.id, sdp });
  });

  socket.on("candidate", ({ room, target, candidate }) => {
    socket
      .to(room)
      .to(target)
      .emit("candidate", { room, sender: socket.id, candidate });
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
