const Topic = require("../models/Topic");

exports.createTopic = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

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

      topicData.parent = parentTopic._id;

      topicData.ancestors = [...parentTopic.ancestors, parentTopic._id];
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
    const topic = await Topic.findById(req.params.id).populate(
      "creator",
      "username",
    );

    if (!topic) {
      return res.status(404).json({ message: "Temat nie znaleziony" });
    }

    const subtopics = await Topic.find({ parent: topic._id });

    res.status(200).json({
      status: "success",
      data: {
        topic,
        subtopics,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};
