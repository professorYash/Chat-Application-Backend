require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
const connectDB = require("./models/db");
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
});

const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'PUT', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Connection to database
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// const server = app.listen(process.env.PORT, () =>
//   console.log(`Server started on ${process.env.PORT}`)
// );


global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

server.listen(process.env.PORT, () => console.log('Server started at successfully!!!'));
