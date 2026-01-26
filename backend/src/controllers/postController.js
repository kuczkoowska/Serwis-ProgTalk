const Post = require("../models/Post");
const Topic = require("../models/Topic");
const Tag = require("../models/Tag");
const { isUserBlockedInTopic } = require("../utils/permissions");

exports.createPost = async (req, res) => {
  try {
    const { content, topicId, tags, replyTo } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic)
      return res.status(404).json({ message: "Temat nie znaleziony" });
    if (topic.isClosed)
      return res.status(403).json({ message: "Temat zamknięty" });

    const isBlocked = await isUserBlockedInTopic(req.user._id, topicId);
    if (isBlocked) {
      return res.status(403).json({
        message: "Jesteś zablokowany w tym temacie",
      });
    }

    let validatedTags = [];
    if (tags && tags.length > 0) {
      const existingTags = await Tag.find({
        _id: { $in: tags },
        topic: topicId,
      });

      if (existingTags.length !== tags.length) {
        return res.status(400).json({
          message: "Niektóre tagi nie istnieją dla tego tematu.",
        });
      }
      validatedTags = existingTags.map((tag) => tag._id);
    }

    const newPost = await Post.create({
      content,
      author: req.user._id,
      topic: topicId,
      tags: validatedTags,
      replyTo: replyTo || null,
    });

    await newPost.populate("author", "username");
    await newPost.populate("tags", "name color");
    if (replyTo) await newPost.populate("replyTo", "content author");

    res.status(201).json({
      status: "success",
      data: { post: newPost },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd podczas dodawania wpisu", error: error.message });
  }
};

exports.getTopicPosts = async (req, res) => {
  try {
    const { topicId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie istnieje." });
    }

    const filter = { topic: topicId };
    if (req.user.role !== "admin") {
      filter.isDeleted = false;
    }

    const posts = await Post.find(filter)
      .populate("author", "username") // Pokaż kto napisał
      .populate("tags", "name color")
      .populate("replyTo", "content author")
      .sort("createdAt")
      .skip(skip) // Pomiń X wpisów z poprzednich stron
      .limit(limit); // Pobierz tylko Y wpisów

    const totalPosts = await Post.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: posts.length,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      data: { posts },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Wpis nie istnieje." });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({
      status: "success",
      message: isLiked ? "Polubienie usunięte" : "Wpis polubiony",
      data: { likesCount: post.likes.length },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.deleteOwnPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Wpis nie znaleziony." });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Możesz usuwać tylko własne wpisy.",
      });
    }

    if (post.isDeleted) {
      return res.status(400).json({
        message: "Wpis został już usunięty.",
      });
    }

    post.isDeleted = true;
    post.deletedAt = Date.now();
    await post.save();

    res.status(200).json({
      status: "success",
      message:
        "Wpis został usunięty (nie jest widoczny dla innych użytkowników).",
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};
