const Tag = require("../models/Tag");
const Topic = require("../models/Topic");
const authService = require("../services/authorizationService");
const TAG_COLORS = require("../utils/constants/colors");

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find()
      .populate("creator", "username")
      .sort("-usageCount name");

    res.status(200).json({
      status: "success",
      results: tags.length,
      data: { tags },
    });
  } catch (error) {
    res.status(500).json({
      message: "Błąd serwera",
      error: error.message,
    });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nazwa tagu jest wymagana.",
      });
    }

    if (!authService.isAdmin(req.user)) {
      const isModerator = await authService.isModerator(req.user._id);
      if (!isModerator) {
        return res.status(403).json({
          message: "Tylko moderatorzy tematów mogą tworzyć nowe tagi.",
        });
      }
    }

    const existingTag = await Tag.findOne({
      name: name.toLowerCase().trim(),
    });

    if (existingTag) {
      return res.status(400).json({
        message: "Tag o tej nazwie już istnieje globalnie.",
      });
    }

    const randomColor =
      TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

    const newTag = await Tag.create({
      name: name.toLowerCase().trim(),
      color: randomColor,
      creator: req.user._id,
      usageCount: 0,
    });

    res.status(201).json({
      status: "success",
      data: { tag: newTag },
    });
  } catch (error) {
    res.status(500).json({
      message: "Błąd przy tworzeniu tagu",
      error: error.message,
    });
  }
};

exports.getTagsForTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId).populate("tags");

    if (!topic) {
      return res.status(404).json({
        message: "Temat nie znaleziony.",
      });
    }

    res.status(200).json({
      status: "success",
      results: topic.tags.length,
      data: { tags: topic.tags },
    });
  } catch (error) {
    res.status(500).json({
      message: "Błąd serwera",
      error: error.message,
    });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag nie znaleziony." });
    }

    if (!authService.isAdmin(req.user)) {
      return res.status(403).json({
        message: "Tylko administratorzy mogą usuwać tagi.",
      });
    }

    await Topic.updateMany({ tags: tagId }, { $pull: { tags: tagId } });

    await Tag.findByIdAndDelete(tagId);

    res.status(200).json({
      status: "success",
      message: "Tag usunięty.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Błąd serwera",
      error: error.message,
    });
  }
};

exports.addTagToTopic = async (req, res) => {
  try {
    const { topicId, tagId } = req.body;

    if (!topicId || !tagId) {
      return res.status(400).json({
        message: "ID tematu i tagu są wymagane.",
      });
    }

    const canManage = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );

    if (!canManage) {
      return res.status(403).json({
        message: "Tylko moderatorzy mogą zarządzać tagami tematu.",
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag nie znaleziony." });
    }

    if (topic.tags.includes(tagId)) {
      return res.status(400).json({
        message: "Ten tag jest już przypisany do tematu.",
      });
    }

    topic.tags.push(tagId);
    await topic.save();

    tag.usageCount += 1;
    await tag.save();

    res.status(200).json({
      status: "success",
      message: "Tag został przypisany do tematu.",
      data: { topic },
    });
  } catch (error) {
    res.status(500).json({
      message: "Błąd serwera",
      error: error.message,
    });
  }
};

exports.removeTagFromTopic = async (req, res) => {
  try {
    const { topicId, tagId } = req.body;

    if (!topicId || !tagId) {
      return res.status(400).json({
        message: "ID tematu i tagu są wymagane.",
      });
    }

    const canManage = await authService.canManageTopic(
      req.user._id,
      topicId,
      req.user.role,
    );

    if (!canManage) {
      return res.status(403).json({
        message: "Tylko moderatorzy mogą zarządzać tagami tematu.",
      });
    }

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony." });
    }

    topic.tags = topic.tags.filter((t) => t.toString() !== tagId);
    await topic.save();

    const tag = await Tag.findById(tagId);
    if (tag && tag.usageCount > 0) {
      tag.usageCount -= 1;
      await tag.save();
    }

    res.status(200).json({
      status: "success",
      message: "Tag został usunięty z tematu.",
      data: { topic },
    });
  } catch (error) {
    res.status(500).json({
      message: "Błąd serwera",
      error: error.message,
    });
  }
};
