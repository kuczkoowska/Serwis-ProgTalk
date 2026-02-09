const Topic = require("../models/Topic");

const removeModeratorFromSubtopics = async (parentTopicId, userId) => {
  const subtopics = await Topic.find({ parent: parentTopicId });

  await Promise.all(
    subtopics.map(async (subtopic) => {
      if (subtopic.creator.toString() !== userId) {
        const originalLength = subtopic.moderators.length;
        subtopic.moderators = subtopic.moderators.filter(
          (m) => m.user.toString() !== userId.toString(),
        );

        if (subtopic.moderators.length !== originalLength) {
          await subtopic.save();
        }
      }

      await removeModeratorFromSubtopics(subtopic._id, userId);
    }),
  );
};

const moderatorToSubtopics = async (parentTopicId, userId, promotedBy) => {
  const subtopics = await Topic.find({ parent: parentTopicId });

  await Promise.all(
    subtopics.map(async (subtopic) => {
      const alreadyMod = subtopic.moderators.some(
        (m) => m.user.toString() === userId.toString(),
      );

      if (!alreadyMod) {
        subtopic.moderators.push({
          user: userId,
          promotedBy: promotedBy,
        });
        await subtopic.save();
      }

      await moderatorToSubtopics(subtopic._id, userId, promotedBy);
    }),
  );
};

module.exports = {
  moderatorToSubtopics,
  removeModeratorFromSubtopics,
};
