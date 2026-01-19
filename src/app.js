require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// routes
const authRoutes = require("./routes/authRoutes");
const topicRoutes = require("./routes/topicRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/progtalk")
  .then(() => console.log("Połączono z MongoDB"))
  .catch((err) => console.error("Błąd połączenia z bazą:", err));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("Serwer ProgTalk działa!");
});

const options = {
  key: fs.readFileSync("ssl/server.key"),
  cert: fs.readFileSync("ssl/server.crt"),
};

const httpsServer = https.createServer(options, app);

const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
  console.log(`Serwer nasłuchuje na https://localhost:${PORT}`);
});
