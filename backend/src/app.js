require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerDocs = require("./config/swagger");

// routes
const authRoutes = require("./routes/authRoutes");
const topicRoutes = require("./routes/topicRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const tagRoutes = require("./routes/tagRoutes");
const adminRoutes = require("./routes/adminRoutes");
const moderatorApplicationRoutes = require("./routes/moderatorApplication");
const moderatorRoutes = require("./routes/moderatorRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Zbyt wiele zapytań z tego IP, spróbuj ponownie za 15 minut.",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

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
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Serwer ProgTalk działa!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Wystąpił błąd serwera.",
    },
  });
});

module.exports = app;
