// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import { Server } from "socket.io";
import http from "http";

import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import smartAssignRoutes from "./routes/smartAssignRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import recentActionsRoutes from "./routes/recentActionsRoutes.js";


// configuration
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all frontend origins (for dev)
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

//middlewares
app.use(cors());
app.use(express.json());

// API Routes 
app.get("/", (req, res) => res.send("API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/smart", smartAssignRoutes);
app.use("/api/users", userRoutes);
app.use("/api/allActions", recentActionsRoutes);

app.set("io", io)
global.ioInstance = io;

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(" New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
