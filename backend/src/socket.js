const jwt = require("jsonwebtoken");
const User = require("./models/User");

module.exports = (io) => {
  const onlineUsers = new Map();

  io.onlineUsers = onlineUsers;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Brak tokenu autoryzacji"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        _id: decoded.id,
      };

      const userDb = await User.findById(decoded.id).select("+role");
      if (!userDb) {
        return next(new Error("Użytkownik nie istnieje"));
      }

      socket.user.role = userDb.role;
      socket.user.username = userDb.username;

      next();
    } catch (err) {
      console.log("Błąd autoryzacji socketa:", err.message);
      next(new Error("Nieprawidłowy token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const userRole = socket.user.role;

    console.log(`Klient połączony: ${socket.id}`);

    if (userId) {
      socket.join(`user_${userId}`);
      onlineUsers.set(userId, socket.id);

      if (userRole === "admin") {
        socket.join("admins");
        console.log(`Admin ${userId} dołączył do pokoju adminow.`);
      }
    }

    socket.on("join_admin_room", () => {
      if (userRole === "admin") {
        socket.join("admins");
      } else {
        console.warn(
          `Próba nieautoryzowanego dostępu do admin room: ${socket.id}`,
        );
      }
    });

    socket.on("join_topic", (topicId) => {
      socket.join(`topic_${topicId}`);
    });

    socket.on("leave_topic", (topicId) => {
      socket.leave(`topic_${topicId}`);
    });

    socket.on("join_topics_list", () => {
      socket.join("topics_list");
    });

    socket.on("leave_topics_list", () => {
      socket.leave("topics_list");
    });

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
      }
      console.log(`Klient rozłączony: ${socket.id}`);
    });
  });

  return io;
};
