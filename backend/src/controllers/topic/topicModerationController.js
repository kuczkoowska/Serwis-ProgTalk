const Topic = require("../../models/Topic");
const authService = require("../../services/authorizationService");
const { ACTION_TYPES } = require("../../utils/constants/actionTypes");
const SystemLogs = require("../../models/SystemLogs");
const notificationService = require("../../services/notificationService");

const closeSubtopicsRecursively = async (parentId, performerId) => {
  const subtopics = await Topic.find({ parent: parentId });
  for (const subtopic of subtopics) {
    if (!subtopic.isClosed) {
      subtopic.isClosed = true;
      await subtopic.save();

      await SystemLogs.create({
        performer: performerId,
        actionType: ACTION_TYPES.TOPIC_CLOSE,
        targetTopic: subtopic._id,
      });
    }
    await closeSubtopicsRecursively(subtopic._id, performerId);
  }
};

const openSubtopicsRecursively = async (parentId, performerId) => {
  const subtopics = await Topic.find({ parent: parentId });
  for (const subtopic of subtopics) {
    if (subtopic.isClosed) {
      subtopic.isClosed = false;
      await subtopic.save();

      await SystemLogs.create({
        performer: performerId,
        actionType: ACTION_TYPES.TOPIC_OPEN,
        targetTopic: subtopic._id,
      });
    }
    await openSubtopicsRecursively(subtopic._id, performerId);
  }
};

exports.closeTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { includeSubtopics } = req.body || {};

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

    topic.isClosed = true;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_CLOSE,
      targetTopic: topicId,
    });

    if (includeSubtopics) {
      await closeSubtopicsRecursively(topicId, req.user._id);
    }

    notificationService.notifyTopicClosed(topicId, topic.name, req.user);

    res.status(200).json({
      status: "success",
      message: includeSubtopics
        ? "Temat i jego podtematy zostały zamknięte."
        : "Temat został zamknięty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.openTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { includeSubtopics } = req.body || {};

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

    topic.isClosed = false;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_OPEN,
      targetTopic: topicId,
    });

    if (includeSubtopics) {
      await openSubtopicsRecursively(topicId, req.user._id);
    }

    notificationService.notifyTopicOpened(topicId, topic.name, req.user);

    res.status(200).json({
      status: "success",
      message: includeSubtopics
        ? "Temat i jego podtematy zostały otwarte."
        : "Temat został otwarty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.hideTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!authService.isAdmin(req.user)) {
      return res
        .status(403)
        .json({ message: "Tylko administratorzy mogą ukrywać tematy." });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    topic.isHidden = true;
    topic.isClosed = true;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_HIDE,
      targetTopic: topicId,
    });

    notificationService.notifyTopicHidden(topicId, topic.name, req.user);

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

    if (!authService.isAdmin(req.user)) {
      return res
        .status(403)
        .json({ message: "Tylko administratorzy mogą odkrywać tematy." });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    topic.isHidden = false;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_UNHIDE,
      targetTopic: topicId,
    });

    notificationService.notifyTopicUnhidden(topicId, topic.name, req.user);

    res.status(200).json({
      status: "success",
      message: "Temat został odkryty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
