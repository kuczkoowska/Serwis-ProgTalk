module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`Klient połączony przez WebSocket: ${socket.id}`);

    socket.on("join_admin_room", () => {
      // TODO: weryfikacja tokena czy to na pewno admin
      socket.join("admins");
      console.log(
        `Użytkownik ${socket.id} dołączył do kanału dla Administratorów`,
      );
    });

    socket.on("disconnect", () => {
      console.log(`Klient rozłączony: ${socket.id}`);
    });
  });
};
