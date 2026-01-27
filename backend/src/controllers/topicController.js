const Topic = require("../models/Topic");
const ModeratorApplication = require("../models/ModeratorApplication");
const { canManageTopic } = require("../utils/permissions");

exports.createTopic = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    const topicData = {
      name,
      description,
      creator: req.user._id,
      ancestors: [],
    };

    if (parentId) {
      const parentTopic = await Topic.findById(parentId);

      if (!parentTopic) {
        return res
          .status(404)
          .json({ message: "Temat nadrzędny nie istnieje." });
      }

      if (parentTopic.isClosed) {
        return res.status(400).json({
          message: "Nie można tworzyć podtematów w zamkniętym temacie.",
        });
      }

      const hasPerm = await canManageTopic(req.user._id, parentId);
      if (!hasPerm && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Tylko moderatorzy mogą tworzyć podtematy.",
        });
      }

      topicData.parent = parentTopic._id;
      topicData.ancestors = [...parentTopic.ancestors, parentTopic._id];

      topicData.moderators = parentTopic.moderators.map((mod) => ({
        user: mod.user,
        promotedBy: mod.promotedBy,
        promotedAt: mod.promotedAt,
      }));
    }

    const newTopic = await Topic.create(topicData);

    res.status(201).json({
      status: "success",
      data: { topic: newTopic },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd przy tworzeniu tematu", error: error.message });
  }
};

exports.getAllTopics = async (req, res) => {
  try {
    // root=true - zwróć tylko tematy główne
    const filter = {};
    if (req.query.root === "true") {
      filter.parent = null;
    }

    if (req.user.role !== "admin") {
      filter.isHidden = false;
    }

    const topics = await Topic.find(filter)
      .populate("creator", "username")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: topics.length,
      data: { topics },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.getTopicDetails = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate(
      "creator",
      "username",
    );

    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony" });
    }

    if (topic.isHidden && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Temat jest ukryty i niedostępny dla użytkowników.",
      });
    }

    const subtopicsFilter = { parent: topic._id };
    if (req.user.role !== "admin") {
      subtopicsFilter.isHidden = false;
    }

    const subtopics = await Topic.find(subtopicsFilter);

    res.status(200).json({
      status: "success",
      data: {
        topic,
        subtopics,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

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

exports.closeTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

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

    topic.isClosed = true;
    await topic.save();

    res.status(200).json({
      status: "success",
      message: "Temat został zamknięty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.openTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

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

    topic.isClosed = false;
    await topic.save();

    res.status(200).json({
      status: "success",
      message: "Temat został otwarty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.hideTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    topic.isHidden = true;
    await topic.save();

    res.status(200).json({
      status: "success",
      message: "Temat został ukryty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unhideTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    topic.isHidden = false;
    await topic.save();

    res.status(200).json({
      status: "success",
      message: "Temat został odkryty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTopicMetadata = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { description } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    const hasPerm = await canManageTopic(req.user._id, topicId);
    if (!hasPerm && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Tylko moderatorzy mogą edytować metadane tematu.",
      });
    }

    if (description) {
      topic.description = description;
    }

    await topic.save();

    res.status(200).json({
      status: "success",
      message: "Metadane tematu zaktualizowane.",
      data: { topic },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
