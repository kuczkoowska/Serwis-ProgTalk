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

  notifyNewUserRegistration(user) {
    this.emitToRoom("admins", "new_user_registration", {
      email: user.email,
      id: user._id,
      message: "Nowy użytkownik oczekuje na akceptację",
    });
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
      message: `Użytkownik ${user.username} został zablokowany przez ${blocker.username}`,
    });

    this.emitToRoom(`user_${user._id}`, "user_blocked_globally", {
      userId: user._id,
      reason: reason || "Zablokowany przez administratora",
      message: "Twoje konto zostało zablokowane. Zostaniesz wylogowany.",
    });
  }

  notifyUserUnblocked(user, unblocker) {
    this.emitToRoom("admins", "user_unblocked", {
      userId: user._id,
      username: user.username,
      unblockedBy: unblocker.username,
      message: `Użytkownik ${user.username} został odblokowany przez ${unblocker.username}`,
    });

    this.emitToRoom(`user_${user._id}`, "user_unblocked_globally", {
      userId: user._id,
      message:
        "Twoje konto zostało odblokowane. Możesz ponownie korzystać z systemu.",
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

  notifyPostLiked(postId, topicId, likesCount, isLiked, userId) {
    this.emitToRoom(`topic_${topicId}`, "post_liked", {
      postId,
      likesCount,
      isLiked,
    });
  }

  notifyNewMessage(recipientId, senderId, messageData) {
    this.emitToRoom(`user_${recipientId}`, "new_message", {
      message: messageData,
    });
  }

  notifySupportMessage(messageData) {
    this.emitToRoom("admins", "new_support_message", {
      message: messageData,
    });
  }

  notifyTopicClosed(topicId, topicName, closedBy) {
    this.emitToRoom(`topic_${topicId}`, "topic_closed", {
      topicId,
      topicName,
      closedBy: closedBy.username,
      message: `Temat "${topicName}" został zamknięty przez ${closedBy.username}`,
    });
  }

  notifyTopicOpened(topicId, topicName, openedBy) {
    this.emitToRoom(`topic_${topicId}`, "topic_opened", {
      topicId,
      topicName,
      openedBy: openedBy.username,
      message: `Temat "${topicName}" został otwarty przez ${openedBy.username}`,
    });
  }

  notifyTopicHidden(topicId, topicName, hiddenBy) {
    this.emitToRoom(`topic_${topicId}`, "topic_hidden", {
      topicId,
      topicName,
      hiddenBy: hiddenBy.username,
      message: `Temat "${topicName}" został ukryty przez ${hiddenBy.username}`,
    });
    this.emitToRoom("admins", "topic_hidden", {
      topicId,
      topicName,
      hiddenBy: hiddenBy.username,
      message: `Temat "${topicName}" został ukryty`,
    });
  }

  notifyTopicUnhidden(topicId, topicName, unhiddenBy) {
    this.emitToRoom(`topic_${topicId}`, "topic_unhidden", {
      topicId,
      topicName,
      unhiddenBy: unhiddenBy.username,
      message: `Temat "${topicName}" został odkryty przez ${unhiddenBy.username}`,
    });
  }

  notifyModeratorAdded(topicId, topicName, newModerator, promotedBy) {
    this.emitToRoom(`topic_${topicId}`, "moderator_added", {
      topicId,
      topicName,
      moderator: newModerator.username,
      moderatorId: newModerator._id,
      promotedBy: promotedBy.username,
      message: `${newModerator.username} został moderatorem przez ${promotedBy.username}`,
    });
  }

  notifyModeratorRemoved(topicId, topicName, removedModerator, removedBy) {
    this.emitToRoom(`topic_${topicId}`, "moderator_removed", {
      topicId,
      topicName,
      moderator: removedModerator.username,
      moderatorId: removedModerator._id,
      removedBy: removedBy.username,
      message: `${removedModerator.username} przestał być moderatorem`,
    });
  }

  notifyPostDeleted(postId, topicId, deletedBy) {
    this.emitToRoom(`topic_${topicId}`, "post_deleted", {
      postId,
      deletedBy: deletedBy.username,
      message: `Post został usunięty przez ${deletedBy.username}`,
    });
  }

  notifyUserBlockedInTopic(topicId, topicName, blockedUser, blockedBy, reason) {
    this.emitToRoom(`user_${blockedUser._id}`, "user_blocked_in_topic", {
      topicId,
      topicName,
      username: blockedUser.username,
      userId: blockedUser._id,
      blockedBy: blockedBy.username,
      reason,
      message: `Zostałeś zablokowany w temacie "${topicName}" przez ${blockedBy.username}${reason ? `: ${reason}` : ""}`,
    });
  }

  notifyUserUnblockedInTopic(topicId, topicName, unblockedUser, unblockedBy) {
    this.emitToRoom(`user_${unblockedUser._id}`, "user_unblocked_in_topic", {
      topicId,
      topicName,
      username: unblockedUser.username,
      userId: unblockedUser._id,
      unblockedBy: unblockedBy.username,
      message: `Zostałeś odblokowany w temacie "${topicName}" przez ${unblockedBy.username}`,
    });
  }

  notifyApplicationApproved(applicantId, topicId, topicName) {
    this.emitToRoom(`user_${applicantId}`, "application_approved", {
      topicId,
      topicName,
      message: `Twoje zgłoszenie na moderatora tematu "${topicName}" zostało zatwierdzone!`,
    });
  }

  notifyApplicationRejected(applicantId, topicId, topicName, reason) {
    this.emitToRoom(`user_${applicantId}`, "application_rejected", {
      topicId,
      topicName,
      message: `Twoje zgłoszenie na moderatora tematu "${topicName}" zostało odrzucone.`,
      reason: reason || "",
    });
  }

  notifyNewModeratorApplication(topic, applicant) {
    const recipientIds = new Set();

    if (topic.creator) {
      recipientIds.add(topic.creator.toString());
    }

    topic.moderators.forEach((mod) => {
      recipientIds.add(mod.user.toString());
    });

    recipientIds.forEach((userId) => {
      this.emitToRoom(`user_${userId}`, "new_moderator_application", {
        topicId: topic._id,
        topicName: topic.name,
        applicant: {
          id: applicant._id,
          username: applicant.username,
        },
        message: `${applicant.username} zgłosił się na moderatora tematu "${topic.name}"`,
      });
    });
  }
}

module.exports = new NotificationService();
