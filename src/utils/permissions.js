const Topic = require("../models/Topic");

exports.canManageTopic = async (userId, topicId) => {
  const topic = await Topic.findById(topicId).populate("ancestors");
  if (!topic) return false;

  const topicsToCheck = [topic, ...(topic.ancestors || [])];

  return topicsToCheck.some((t) => {
    if (t.creator === userId) return true;

    const isMod = t.moderators.some((m) => m.user === userId);
    return isMod;
  });
};
