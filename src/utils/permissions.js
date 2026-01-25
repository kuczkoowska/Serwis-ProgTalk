const Topic = require("../models/Topic");

exports.canManageTopic = async (userId, topicId) => {
  const topic = await Topic.findById(topicId).populate("ancestors");
  if (!topic) return false;

  const topicsToCheck = [topic, ...(topic.ancestors || [])];
  const userIdStr = userId.toString(); //aby bralo dane a nie odnośnik

  return topicsToCheck.some((t) => {
    if (t.creator.toString() === userIdStr) return true;

    const isMod = t.moderators.some((m) => m.user.toString() === userIdStr);
    return isMod;
  });
};

exports.isUserBlockedInTopic = async (userId, topicId) => {
  const topic = await Topic.findById(topicId).populate("ancestors");
  if (!topic) return false;

  const userIdStr = userId.toString();

  const blockedInCurrent = topic.blockedUsers.find(
    (b) => b.user.toString() === userIdStr,
  );
  if (blockedInCurrent) return true;

  if (topic.ancestors && topic.ancestors.length > 0) {
    for (const ancestor of topic.ancestors) {
      const blockedInAncestor = ancestor.blockedUsers.find(
        (b) => b.user.toString() === userIdStr,
      );
      if (blockedInAncestor) {
        const isException = blockedInAncestor.allowedSubtopics.some(
          (allowedId) => allowedId.toString() === topic._id.toString(),
        );

        if (isException) {
          continue;
        } else {
          return true;
        }
      }
    }
  }
  return false;
};
