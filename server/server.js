const { Server } = require("socket.io");

const io = new Server(8080, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();
const roomCounts = new Map();

io.on("connection", (socket) => {
  console.log("socket connecting", socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    increamentRoomCount(room);
    io.to(room).emit("user:joined", {
      email,
      id: socket.id,
      roomCounts: getRoomCounts(room),
    });
    socket.join(room); //user joined
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id, answer });
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});

function increamentRoomCount(room) {
  const count = roomCounts.get(room) || 0;
  roomCounts.set(room.count + 1);
}

function decreamentRoomCount(room) {
  const count = roomCounts.get(room) || 0;
  if (count > 0) {
    roomCounts.set(room, count - 1);
  }
}

function getRoomCounts(room) {
  return roomCounts.get(room) || 0;
}
