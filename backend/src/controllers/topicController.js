const Topic = require("../models/Topic");
const {
  canManageTopic,
  isUserBlockedInTopic,
} = require("../utils/permissions");

exports.createTopic = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    const existingTopic = await Topic.findOne({
      name: name.trim(),
      parent: parentId || null,
    });

    if (existingTopic) {
      return res.status(400).json({
        message: parentId
          ? "Podtemat o tej nazwie już istnieje w tym temacie nadrzędnym."
          : "Temat główny o tej nazwie już istnieje.",
      });
    }

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

      const isBlocked = await isUserBlockedInTopic(req.user._id, parentId);
      if (isBlocked) {
        return res.status(403).json({
          message:
            "Jesteś zablokowany w tym temacie i nie możesz tworzyć podtematów.",
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

      const creatorAlreadyModerator = topicData.moderators.some(
        (mod) => mod.user.toString() === parentTopic.creator.toString(),
      );

      if (!creatorAlreadyModerator) {
        topicData.moderators.push({
          user: parentTopic.creator,
          promotedBy: parentTopic.creator,
          promotedAt: parentTopic.createdAt || Date.now(),
        });
      }
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
    const topic = await Topic.findById(req.params.id)
      .populate("creator", "username")
      .populate("blockedUsers.user", "username email")
      .populate("moderators.user", "username email");

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

    const isBlocked = await isUserBlockedInTopic(req.user._id, topic._id);
    const canPost = !topic.isClosed && !isBlocked;

    const canManage =
      (await canManageTopic(req.user._id, topic._id)) ||
      req.user.role === "admin";

    res.status(200).json({
      status: "success",
      data: {
        topic,
        subtopics,
        canPost,
        canManage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
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
    topic.isClosed = true;
    await topic.save();

    res.status(200).json({
      status: "success",
      message: "Temat został ukryty i zamknięty.",
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
