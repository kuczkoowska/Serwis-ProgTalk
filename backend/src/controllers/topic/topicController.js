const Topic = require("../../models/Topic");
const SystemLogs = require("../../models/SystemLogs");
const authService = require("../../services/authorizationService");
const notificationService = require("../../services/notificationService");
const paginationService = require("../../services/paginationService");
const { ACTION_TYPES } = require("../../utils/constants/actionTypes");

exports.createTopic = async (req, res) => {
  try {
    const { name, description, parentId, tags } = req.body;

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
      tags: tags || [],
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

      const isBlocked = await authService.isUserBlockedInTopic(
        req.user._id,
        parentId,
      );
      if (isBlocked) {
        return res.status(403).json({
          message:
            "Jesteś zablokowany w tym temacie i nie możesz tworzyć podtematów.",
        });
      }

      const hasPerm = await authService.canManageTopic(
        req.user._id,
        parentId,
        req.user.role,
      );
      if (!hasPerm) {
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

    await newTopic.populate("creator", "username");
    await newTopic.populate("tags", "name color");

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_CREATE,
      targetTopic: newTopic._id,
    });

    notificationService.notifyNewTopic(newTopic, parentId);

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
    const filter = {};
    if (req.query.root === "true") filter.parent = null;
    if (req.user.role !== "admin") filter.isHidden = false;

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    const { page, limit, skip } = paginationService.getPaginationParams(
      req.query,
      12,
    );

    const sortOption = paginationService.getSortOption(req.query);

    const topics = await Topic.find(filter)
      .populate("creator", "username")
      .populate("tags", "name color")
      .sort(sortOption)
      .skip(skip)
      .limit(limit + 1);

    const { items: results, pagination } = paginationService.formatResponse(
      topics,
      page,
      limit,
    );

    res.status(200).json({
      status: "success",
      results: results.length,
      data: {
        topics: results,
        pagination,
      },
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
      .populate("moderators.user", "username email")
      .populate({
        path: "ancestors",
        select: "name _id",
        options: { strictPopulate: false },
      });

    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony" });
    }

    if (topic.isHidden && !authService.isAdmin(req.user)) {
      return res.status(403).json({
        message: "Temat jest ukryty i niedostępny dla użytkowników.",
      });
    }

    const subtopicsFilter = { parent: topic._id };
    if (!authService.isAdmin(req.user)) {
      subtopicsFilter.isHidden = false;
    }

    const subtopics = await Topic.find(subtopicsFilter);

    const isBlocked = await authService.isUserBlockedInTopic(
      req.user._id,
      topic._id,
    );
    const canPost = !topic.isClosed && !isBlocked;

    const canManage = await authService.canManageTopic(
      req.user._id,
      topic._id,
      req.user.role,
    );

    res.status(200).json({
      status: "success",
      data: {
        topic,
        subtopics,
        canPost,
        canManage,
        isBlocked,
        isClosed: topic.isClosed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
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

    const hasPerm = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );
    if (!hasPerm) {
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
