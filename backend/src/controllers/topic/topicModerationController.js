const Topic = require("../../models/Topic");
const SystemLogs = require("../../models/SystemLogs");
const authService = require("../../services/authorizationService");
const notificationService = require("../../services/notificationService");
const { ACTION_TYPES } = require("../../utils/constants/actionTypes");

const closeSubtopicsRecursively = async (parentId, performerId) => {
  const subtopics = await Topic.find({ parent: parentId });
  for (const subtopic of subtopics) {
    if (!subtopic.isClosed) {
      subtopic.isClosed = true;
      await subtopic.save();

      notificationService.notifyTopicStatusChanged(subtopic._id, true);

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

      notificationService.notifyTopicStatusChanged(subtopic._id, false);

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

    if (
      !(await authService.canManageTopic(req.user._id, topicId, req.user.role))
    ) {
      return res
        .status(403)
        .json({ status: "fail", message: "Brak uprawnień." });
    }

    const topic = await Topic.findById(topicId);
    if (!topic)
      return res
        .status(404)
        .json({ status: "fail", message: "Temat nie znaleziony." });

    topic.isClosed = true;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_CLOSE,
      targetTopic: topicId,
    });

    notificationService.notifyTopicClosed(topicId, topic.name, req.user);

    if (includeSubtopics) {
      await closeSubtopicsRecursively(topicId, req.user._id);
    }

    res.status(200).json({
      status: "success",
      message: includeSubtopics
        ? "Temat i podtematy zamknięte."
        : "Temat zamknięty.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.openTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { includeSubtopics } = req.body || {};

    if (
      !(await authService.canManageTopic(req.user._id, topicId, req.user.role))
    ) {
      return res
        .status(403)
        .json({ status: "fail", message: "Brak uprawnień." });
    }

    const topic = await Topic.findById(topicId);
    if (!topic)
      return res
        .status(404)
        .json({ status: "fail", message: "Temat nie znaleziony." });

    topic.isClosed = false;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_OPEN,
      targetTopic: topicId,
    });

    notificationService.notifyTopicOpened(topicId, topic.name, req.user);

    if (includeSubtopics) {
      await openSubtopicsRecursively(topicId, req.user._id);
    }

    res.status(200).json({
      status: "success",
      message: includeSubtopics
        ? "Temat i podtematy otwarte."
        : "Temat otwarty.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.hideTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!authService.isAdmin(req.user))
      return res
        .status(403)
        .json({ status: "fail", message: "Brak uprawnień." });

    const topic = await Topic.findById(topicId);
    if (!topic)
      return res
        .status(404)
        .json({ status: "fail", message: "Nie znaleziono." });

    topic.isHidden = true;
    topic.isClosed = true;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_HIDE,
      targetTopic: topicId,
    });

    notificationService.notifyTopicHidden(topicId, topic.name, req.user);

    res.status(200).json({ status: "success", message: "Ukryto temat." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.unhideTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    if (!authService.isAdmin(req.user))
      return res
        .status(403)
        .json({ status: "fail", message: "Brak uprawnień." });

    const topic = await Topic.findById(topicId);
    topic.isHidden = false;
    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_UNHIDE,
      targetTopic: topicId,
    });

    notificationService.notifyTopicUnhidden(topicId, topic.name, req.user);

    res.status(200).json({ status: "success", message: "Odkryto temat." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
