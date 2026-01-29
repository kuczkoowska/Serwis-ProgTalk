const { canManageTopic } = require("../utils/permissions");

class AuthorizationService {
  async canManageTopic(userId, topicId, userRole) {
    if (userRole === "admin") return true;
    return await canManageTopic(userId, topicId);
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
