require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { Server } = require("socket.io");

// routes
const authRoutes = require("./routes/authRoutes");
const topicRoutes = require("./routes/topicRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const tagRoutes = require("./routes/tagRoutes");
const adminRoutes = require("./routes/adminRoutes");
const moderatorApplicationRoutes = require("./routes/moderatorApplication");
const moderatorRoutes = require("./routes/moderatorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/progtalk")
  .then(() => console.log("Połączono z MongoDB"))
  .catch((err) => console.error("Błąd połączenia z bazą:", err));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ProgTalk API",
      version: "1.0.0",
      description: "Dokumentacja API",
    },
  },
  apis: ["./src/docs/*.yaml"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderator-applications", moderatorApplicationRoutes);
app.use("/api/moderators", moderatorRoutes);

app.get("/", (req, res) => {
  res.send("Serwer ProgTalk działa!");
});

const options = {
  key: fs.readFileSync("ssl/server.key"),
  cert: fs.readFileSync("ssl/server.crt"),
};

const httpsServer = https.createServer(options, app);
const socketHandler = require("./socket");

const io = new Server(httpsServer, {
  cors: {
    origin: "*",
  },
});

app.set("socketio", io);
socketHandler(io);

const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na https://localhost:${PORT}`);
  console.log(`Dokumentacja: https://localhost:${PORT}/api-docs`);
});
