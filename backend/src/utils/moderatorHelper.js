const Topic = require("../models/Topic");

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

module.exports = {
  moderatorToSubtopics,
  removeModeratorFromSubtopics,
};
