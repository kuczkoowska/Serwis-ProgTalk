module.exports = (io) => {
  const onlineUsers = new Map();

  io.onlineUsers = onlineUsers;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const userRole = socket.handshake.query.role;

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
