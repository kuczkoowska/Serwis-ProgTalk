module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`Klient połączony przez WebSocket: ${socket.id}`);

    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on("leave_user_room", (userId) => {
      socket.leave(`user_${userId}`);
    });

    socket.on("join_admin_room", () => {
      socket.join("admins");
      console.log(
        `Użytkownik ${socket.id} dołączył do kanału dla Administratorów`,
      );
    });

    socket.on("join_topic", async (topicId) => {
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
      console.log(`Klient rozłączony: ${socket.id}`);
    });
  });

  return io;
};
