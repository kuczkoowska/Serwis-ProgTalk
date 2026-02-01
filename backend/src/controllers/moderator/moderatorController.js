const Topic = require("../../models/Topic");
const User = require("../../models/User");
const authService = require("../../services/authorizationService");
const notificationService = require("../../services/notificationService");
const SystemLogs = require("../../models/SystemLogs");
const { ACTION_TYPES } = require("../../utils/constants/actionTypes");
const {
  moderatorToSubtopics,
  removeModeratorFromSubtopics,
} = require("../../utils/moderatorHelper");

exports.promoteModerator = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userIdToPromote } = req.body;

    const canManage = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );

    if (!canManage) {
      return res
        .status(403)
        .json({ message: "Brak uprawnien do tego tematu." });
    }

    const topic = await Topic.findById(topicId);

    if (topic.moderators.some((m) => m.user.toString() === userIdToPromote)) {
      return res
        .status(400)
        .json({ message: "Dany uzytkownik już jest moderatorem." });
    }

    topic.moderators.push({
      user: userIdToPromote,
      promotedBy: req.user._id,
    });

    await topic.save();

    await moderatorToSubtopics(topicId, userIdToPromote, req.user._id);

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.MODERATOR_ADD,
      targetUser: userIdToPromote,
      targetTopic: topicId,
    });

    const newModerator = await User.findById(userIdToPromote);
    notificationService.notifyModeratorAdded(
      topicId,
      topic.name,
      newModerator,
      req.user,
    );

    res.status(200).json({ message: "Moderator dodany." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.takeBackModerator = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userIdToTake } = req.body;

    const topic = await Topic.findById(topicId).populate("ancestors");
    const mod = topic.moderators.find(
      (m) => m.user.toString() === userIdToTake,
    );

    if (!mod)
      return res
        .status(404)
        .json({ message: "Ten użytkownik nie jest moderatorem." });

    if (topic.creator.toString() === userIdToTake) {
      return res.status(403).json({
        message: "Nie można usunąć moderatora głównego (twórcy tematu).",
      });
    }

    const isPromoter =
      mod.promotedBy && mod.promotedBy.toString() === req.user._id.toString();

    const isCreator = authService.isOwner(topic.creator, req.user._id);
    const isAdmin = authService.isAdmin(req.user);

    const isAncestor = topic.parent
      ? await authService.canManageTopic(
          req.user._id,
          topic.parent,
          req.user.role,
        )
      : false;

    if (!isPromoter && !isCreator && !isAdmin && !isAncestor) {
      return res.status(403).json({
        message:
          "Możesz cofnąć awans tylko osobom, które sam promowałeś (lub jesteś wyżej w hierarchii).",
      });
    }

    topic.moderators = topic.moderators.filter(
      (m) => m.user.toString() !== userIdToTake,
    );
    await topic.save();

    await removeModeratorFromSubtopics(topicId, userIdToTake);

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.MODERATOR_REMOVE,
      targetUser: userIdToTake,
      targetTopic: topicId,
    });

    const removedModerator = await User.findById(userIdToTake);
    notificationService.notifyModeratorRemoved(
      topicId,
      topic.name,
      removedModerator,
      req.user,
    );

    res.status(200).json({ message: "Uprawnienia cofnięte." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockUserInTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userIdToBlock, reason, allowedSubtopicsIds } = req.body;

    const canManage = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );

    if (!canManage) {
      return res.status(403).json({ message: "Brak uprawnień." });
    }

    const topic = await Topic.findById(topicId);

    const existingBlock = topic.blockedUsers.find(
      (b) => b.user.toString() === userIdToBlock,
    );

    if (existingBlock) {
      existingBlock.allowedSubtopics = allowedSubtopicsIds || [];
      existingBlock.reason = reason;
    } else {
      topic.blockedUsers.push({
        user: userIdToBlock,
        reason,
        allowedSubtopics: allowedSubtopicsIds || [],
      });
    }

    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_BLOCK_TOPIC,
      targetUser: userIdToBlock,
      targetTopic: topicId,
      reason: reason || "",
    });

    const blockedUser = await User.findById(userIdToBlock);
    notificationService.notifyUserBlockedInTopic(
      topicId,
      topic.name,
      blockedUser,
      req.user,
      reason,
    );

    res.status(200).json({ message: "Użytkownik zablokowany." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unblockUserInTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userIdToUnblock } = req.body;

    const canManage = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );

    if (!canManage) {
      return res.status(403).json({ message: "Brak uprawnień." });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    const wasBlocked = topic.blockedUsers.some(
      (b) => b.user.toString() === userIdToUnblock,
    );

    if (!wasBlocked) {
      return res
        .status(400)
        .json({ message: "Użytkownik nie był zablokowany w tym temacie." });
    }

    topic.blockedUsers = topic.blockedUsers.filter(
      (b) => b.user.toString() !== userIdToUnblock,
    );

    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_UNBLOCK_TOPIC,
      targetUser: userIdToUnblock,
      targetTopic: topicId,
    });

    const unblockedUser = await User.findById(userIdToUnblock);
    notificationService.notifyUserUnblockedInTopic(
      topicId,
      topic.name,
      unblockedUser,
      req.user,
    );

    res.status(200).json({ message: "Użytkownik odblokowany." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
