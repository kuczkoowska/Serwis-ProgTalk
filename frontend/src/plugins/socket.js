import { io } from "socket.io-client";
import { reactive } from "vue";

class SocketService {
  constructor() {
    const host = window.location.hostname || "localhost";
    const port = 3001;
    const url = `https://${host}:${port}`;

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
      this.state.connected = true;

      this.rejoinActiveRooms();
    });

    this.socket.on("disconnect", (reason) => {
      this.state.connected = false;
    });

    this.socket.on("connect_error", (err) => {
      console.error("Błąd połączenia socket:", err.message);
    });
  }

  connect() {
    const token = localStorage.getItem("token");

    if (token) {
      this.socket.auth = { token };
      this.socket.connect();
    } else {
      console.warn("Próba połączenia z socketem bez tokenu! Anulowano.");
    }
  }

  disconnect() {
    this.socket.disconnect();
    this.activeRooms.clear();
  }

  joinTopic(topicId) {
    if (!topicId || this.activeRooms.has(`topic_${topicId}`)) return;

    this.emit("join_topic", topicId);
    this.activeRooms.add(`topic_${topicId}`);
  }

  leaveTopic(topicId) {
    this.emit("leave_topic", topicId);
    this.activeRooms.delete(`topic_${topicId}`);
  }

  joinTopicsList() {
    if (this.activeRooms.has("topics_list")) return;
    this.emit("join_topics_list");
    this.activeRooms.add("topics_list");
  }

  leaveTopicsList() {
    this.emit("leave_topics_list");
    this.activeRooms.delete("topics_list");
  }

  joinAdminRoom() {
    this.emit("join_admin_room");
  }

  rejoinActiveRooms() {
    if (this.activeRooms.size === 0) return;

    console.log("Przywracam sesje w pokojach...");
    this.activeRooms.forEach((roomName) => {
      if (roomName.startsWith("topic_")) {
        const id = roomName.replace("topic_", "");
        this.socket.emit("join_topic", id);
      } else if (roomName === "topics_list") {
        this.socket.emit("join_topics_list");
      }
    });
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  on(event, callback) {
    this.socket.on(event, callback);
  }

  off(event, callback) {
    this.socket.off(event, callback);
  }
}

export default new SocketService();
