const { instrument } = require("@socket.io/admin-ui")
const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:8080", "https://admin.socket.io"],
  },
})
const userIo = io.of("/user")

const users = {}
userIo.on("connection", (socket) => {
  const username = socket.username
  socket.emit("receive-message", {
    message: `connected to user namespace `,
    username,
  })
})
userIo.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (token === "test") {
    socket.username = socket.handshake.auth.username
    next()
  } else {
    next(new Error("Authentication error"))
  }
})
function getUserNameFromToken(token) {
  return token
}

io.on("connection", (socket) => {
  socket.on("send-message", ({ message, username, room }) => {
    if (room === "")
      return socket.broadcast.emit("receive-message", { message, username })
    else {
      socket.to(room).emit("receive-message", { message, username })
    }
  })
  socket.on("join-room", (room, username, cb) => {
    socket.join(room)
    socket.to(room).emit("receive-message", {
      message: `User ${username} has joined the room ${room}`,
      username,
    })
    cb({ message: `You joined room ${room}`, username })
  })
})

instrument(io, { auth: false })
