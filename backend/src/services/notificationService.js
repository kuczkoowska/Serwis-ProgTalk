class NotificationService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  emitToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  notifyUserApproved(user, approver) {
    this.emitToRoom("admins", "user_approved", {
      userId: user._id,
      username: user.username,
      approvedBy: approver.username,
      message: `Użytkownik ${user.username} został zaakceptowany przez ${approver.username}`,
    });
  }

  notifyUserRejected(username, rejector, reason) {
    this.emitToRoom("admins", "user_rejected", {
      username,
      rejectedBy: rejector.username,
      reason: reason || "Brak powodu",
      message: `Użytkownik ${username} został odrzucony przez ${rejector.username}`,
    });
  }

  notifyUserBlocked(user, blocker, reason) {
    this.emitToRoom("admins", "user_blocked", {
      userId: user._id,
      username: user.username,
      blockedBy: blocker.username,
      reason,
    });
  }

  notifyUserUnblocked(user, unblocker) {
    this.emitToRoom("admins", "user_unblocked", {
      userId: user._id,
      username: user.username,
      unblockedBy: unblocker.username,
    });
  }

  notifyNewTopic(topic, parentId = null) {
    if (parentId) {
      this.emitToRoom(`topic_${parentId}`, "new_subtopic", { topic });
    } else {
      this.emitToRoom("topics_list", "new_topic", { topic });
    }
  }

  notifyNewPost(post, topicId) {
    this.emitToRoom(`topic_${topicId}`, "new_post", { post });
  }

  notifyPostLiked(postId, topicId, likesCount, isLiked) {
    this.emitToRoom(`topic_${topicId}`, "post_liked", {
      postId,
      likesCount,
      isLiked,
    });
  }

}

module.exports = new NotificationService();
