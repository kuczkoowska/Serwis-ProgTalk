class AuthorizationService {
  async canManageTopic(userId, topicId, userRole) {
    if (userRole === "admin") return true;

    const topic = await Topic.findById(topicId).populate("ancestors");
    if (!topic) return false;

    const topicsToCheck = [topic, ...(topic.ancestors || [])];
    const userIdStr = userId.toString();

    return topicsToCheck.some((t) => {
      if (t.creator.toString() === userIdStr) return true;
      const isMod = t.moderators.some((m) => m.user.toString() === userIdStr);
      return isMod;
    });
  }

  async isUserBlockedInTopic(userId, topicId) {
    const topic = await Topic.findById(topicId).populate("ancestors");
    if (!topic) return false;

    const userIdStr = userId.toString();

    const blockedInCurrent = topic.blockedUsers.find(
      (b) => b.user.toString() === userIdStr,
    );
    if (blockedInCurrent) return true;

    if (topic.ancestors && topic.ancestors.length > 0) {
      for (const ancestor of topic.ancestors) {
        const blockedInAncestor = ancestor.blockedUsers.find(
          (b) => b.user.toString() === userIdStr,
        );

        if (blockedInAncestor) {
          const isException = blockedInAncestor.allowedSubtopics.some(
            (allowedId) => allowedId.toString() === topic._id.toString(),
          );

          if (!isException) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isAdmin(user) {
    return user.role === "admin";
  }

  async isModerator(userId) {
    const Topic = require("../models/Topic");
    const isModerator = await Topic.findOne({
      $or: [{ creator: userId }, { "moderators.user": userId }],
    });
    return !!isModerator;
  }

  isOwner(resourceOwnerId, userId) {
    return resourceOwnerId.toString() === userId.toString();
  }
}

module.exports = new AuthorizationService();
