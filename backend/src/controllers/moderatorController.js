const Topic = require("../models/Topic");
const { canManageTopic } = require("../utils/permissions");

exports.promoteModerator = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userIdToPromote } = req.body;

    const hasPerm = await canManageTopic(req.user._id, topicId);
    if (!hasPerm && req.user.role !== "admin") {
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

    const isCreator = topic.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    const isAncestor = topic.parent
      ? await canManageTopic(req.user._id, topic.parent)
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

    res.status(200).json({ message: "Uprawnienia cofnięte." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeModeratorFromSubtopics = async (parentTopicId, userId) => {
  const subtopics = await Topic.find({ parent: parentTopicId });

  for (const subtopic of subtopics) {
    if (subtopic.creator.toString() !== userId) {
      subtopic.moderators = subtopic.moderators.filter(
        (m) => m.user.toString() !== userId,
      );
      await subtopic.save();
    }

    await removeModeratorFromSubtopics(subtopic._id, userId);
  }
};
const moderatorToSubtopics = async (parentTopicId, userId, promotedBy) => {
  const subtopics = await Topic.find({ parent: parentTopicId });

  for (const subtopic of subtopics) {
    if (!subtopic.moderators.some((m) => m.user.toString() === userId)) {
      subtopic.moderators.push({
        user: userId,
        promotedBy: promotedBy,
      });
      await subtopic.save();
    }

    await moderatorToSubtopics(subtopic._id, userId, promotedBy);
  }
};

exports.blockUserInTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userIdToBlock, reason, allowedSubtopicsIds } = req.body;

    if (
      !(await canManageTopic(req.user._id, topicId)) &&
      req.user.role !== "admin"
    ) {
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
    res.status(200).json({ message: "Użytkownik zablokowany." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unblockUserInTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { userIdToUnblock } = req.body;

    if (
      !(await canManageTopic(req.user._id, topicId)) &&
      req.user.role !== "admin"
    ) {
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
    res.status(200).json({ message: "Użytkownik odblokowany." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
