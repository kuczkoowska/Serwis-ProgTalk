const Topic = require("../models/Topic");
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

      topicData.parent = parentTopic._id;

      topicData.ancestors = [...parentTopic.ancestors, parentTopic._id];
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

    const subtopics = await Topic.find({ parent: topic._id });

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

    const isPromoter =
      mod.promotedBy.toString() &&
      mod.promotedBy.toString() === req.user._id.toString();
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
      (m) => m.user.toString() !== userIdToRevoke,
    );
    await topic.save();

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
