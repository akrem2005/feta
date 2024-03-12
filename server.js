// server.js
const http = require("http");
const socketIO = require("socket.io");

const server = http.createServer();
const io = socketIO(server);

let rooms = {};

io.on("connection", (socket) => {
  socket.on("join", ({ room, user }) => {
    if (!rooms[room]) {
      rooms[room] = { users: {} };
    }

    rooms[room].users[user] = socket.id;

    socket.join(room);

    socket.on("disconnect", () => {
      delete rooms[room].users[user];
    });

    socket.on("candidate", ({ room, sender, candidate }) => {
      socket.to(room).to(sender).emit("candidate", { room, sender, candidate });
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
