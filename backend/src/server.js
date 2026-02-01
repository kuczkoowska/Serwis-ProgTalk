require("dotenv").config();
const fs = require("fs");
const https = require("https");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app");
const notificationService = require("./services/notificationService");
const socketHandler = require("./socket");

connectDB();

const options = {
  key: fs.readFileSync("ssl/server.key"),
  cert: fs.readFileSync("ssl/server.crt"),
};

const httpsServer = https.createServer(options, app);

const io = new Server(httpsServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
notificationService.setSocketIO(io);

if (socketHandler) socketHandler(io);

const PORT = process.env.PORT || 3001;
httpsServer.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na https://localhost:${PORT}`);
  console.log(`Dokumentacja: https://localhost:${PORT}/api-docs`);
});
