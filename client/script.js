import { io } from "socket.io-client"

const messageContainer = document.getElementById("message-container")
const form = document.getElementById("message-form")
const messageInput = document.getElementById("Message")
const roomBtn = document.getElementById("join-room")
const roomInput = document.getElementById("room")

const params = new URLSearchParams(window.location.search)
const token = params.get("token")
const user = params.get("username")
const socket = io("http://localhost:3000")
if (token) {
  const userSocket = io("http://localhost:3000/user", {
    auth: {
      token,
      username: getUserFromParams(),
    },
  })
  userSocket.on("connect_error", (err) => {
    console.log(typeof err)
    displayMessage({
      message: "Error Connecting to namespace",
      username: getUserFromParams(),
    })
  })
  userSocket.on("receive-message", ({ message, username }) => {
    displayMessage({ message, username })
  })
}

function getUserFromParams() {
  return user
}

socket.on("connect", () => {
  displayMessage({
    message: `Connected as ${socket.id}`,
    username: getUserFromParams(),
  })
})

socket.on("receive-message", ({ message, username }) => {
  displayMessage({ message, username }, true)
})

form.addEventListener("submit", (e) => {
  e.preventDefault()
  const message = messageInput.value

  if (message.trim() === "") return
  const room = roomInput.value
  socket.emit("send-message", { message, username: getUserFromParams(), room })
  displayMessage({ message, username: getUserFromParams() })
})
function displayMessage({ message, username = "" }, receiver = false) {
  const formattedTime = `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
  const messageDiv = document.createElement("div")
  if (receiver) {
    messageDiv.classList.add("receiver-message")
  }
  messageDiv.innerHTML = `<p> ${message} </p>
  <div class="message-info"> 
  <span> ${username} </span>
  <span> ${formattedTime} </span>
  </div>
  
  `
  messageContainer.append(messageDiv)
  messageInput.value = ""
}

roomBtn.onclick = () => {
  const room = roomInput.value
  if (room.trim() === "") return
  socket.emit(
    "join-room",
    room,
    getUserFromParams(),
    ({ message, username }) => {
      displayMessage({ message, username })
    }
  )
}

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input")) return
  if (event.key === "Enter") socket.connect()
  if (event.key === "Escape") socket.disconnect()
})
