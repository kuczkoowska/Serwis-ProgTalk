const Tag = require("../models/Tag");
const { canManageTopic } = require("../utils/permissions");

exports.createTag = async (req, res) => {
  try {
    const { name, color, topicId } = req.body;

    if (!name || !topicId) {
      return res.status(400).json({
        message: "Nazwa tagu i ID tematu są wymagane.",
      });
    }

    const hasPerm = await canManageTopic(req.user._id, topicId);
    if (!hasPerm && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Tylko moderatorzy mogą tworzyć tagi dla tematu.",
      });
    }

    const existingTag = await Tag.findOne({
      name: name.toLowerCase().trim(),
      topic: topicId,
    });

    if (existingTag) {
      return res.status(400).json({
        message: "Tag o tej nazwie już istnieje dla tego tematu.",
      });
    }

    const newTag = await Tag.create({
      name: name.toLowerCase().trim(),
      color: color || "#3498db",
      creator: req.user._id,
      topic: topicId,
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

    const tags = await Tag.find({ topic: topicId })
      .populate("creator", "username")
      .sort("name");

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

exports.deleteTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag nie znaleziony." });
    }

    const hasPerm = await canManageTopic(req.user._id, tag.topic);
    if (!hasPerm && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Tylko moderatorzy mogą usuwać tagi.",
      });
    }

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
