import { io } from "socket.io-client";
import { reactive } from "vue";

class SocketService {
  constructor() {
    const url = import.meta.env.VITE_SOCKET_URL || "https://localhost:3001";

    this.socket = io(url, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
      rejectUnauthorized: false,
    });

    this.state = reactive({
      connected: false,
    });

    this.activeRooms = new Set();

    this.socket.on("connect", () => {
      console.log("Socket połączony:", this.socket.id);
      this.state.connected = true;
      this.rejoinActiveRooms();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket rozłączony:", reason);
      this.state.connected = false;
    });

    this.socket.on("connect_error", (err) => {
      console.error("Błąd połączenia socket:", err.message);
    });
  }

  connect(token) {
    const authToken = token || localStorage.getItem("token");

    if (authToken) {
      this.socket.auth = { token: authToken };

      if (!this.socket.connected) {
        this.socket.connect();
      }
    } else {
      console.warn("Brak tokenu - nie łączę z socketem.");
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
    this.activeRooms.clear();
  }

  joinTopic(topicId) {
    if (!topicId) return;
    const roomName = `topic_${topicId}`;

    if (this.activeRooms.has(roomName) && this.socket.connected) return;

    this.emit("join_topic", topicId);
    this.activeRooms.add(roomName);
  }

  leaveTopic(topicId) {
    const roomName = `topic_${topicId}`;
    this.emit("leave_topic", topicId);
    this.activeRooms.delete(roomName);
  }

  joinTopicsList() {
    if (this.activeRooms.has("topics_list") && this.socket.connected) return;
    this.emit("join_topics_list");
    this.activeRooms.add("topics_list");
  }

  leaveTopicsList() {
    this.emit("leave_topics_list");
    this.activeRooms.delete("topics_list");
  }

  joinAdminRoom() {
    if (this.activeRooms.has("admins") && this.socket.connected) return;
    this.emit("join_admin_room");
    this.activeRooms.add("admins");
  }

  rejoinActiveRooms() {
    if (this.activeRooms.size === 0) return;

    console.log("Przywracam pokoje socketowe...");
    this.activeRooms.forEach((roomName) => {
      if (roomName.startsWith("topic_")) {
        const id = roomName.replace("topic_", "");
        this.socket.emit("join_topic", id);
      } else if (roomName === "topics_list") {
        this.socket.emit("join_topics_list");
      } else if (roomName === "admins") {
        this.socket.emit("join_admin_room");
      }
    });
  }

  emit(event, data) {
    if (this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    this.socket.on(event, callback);
  }

  off(event, callback) {
    this.socket.off(event, callback);
  }
}

export default new SocketService();
