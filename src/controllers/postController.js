const Post = require("../models/Post");
const Topic = require("../models/Topic");
const { isUserBlockedInTopic } = require("../utils/permissions");

exports.createPost = async (req, res) => {
  try {
    const { content, topicId, tags } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie istnieje." });
    }

    if (topic.isClosed) {
      return res.status(400).json({
        message: "Ten temat jest zamknięty. Nie można dodawać wpisów.",
      });
    }

    const isBlocked = await isUserBlockedInTopic(req.user._id, topicId);
    if (isBlocked) {
      return res.status(403).json({
        message: "Jesteś zablokowany w tym temacie",
      });
    }

    const newPost = await Post.create({
      content,
      topic: topicId,
      author: req.user._id,
      tags: tags || [],
    });

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

    const posts = await Post.find({ topic: topicId })
      .populate("author", "username") // Pokaż kto napisał
      .sort("createdAt")
      .skip(skip) // Pomiń X wpisów z poprzednich stron
      .limit(limit); // Pobierz tylko Y wpisów

    const totalPosts = await Post.countDocuments({ topic: topicId });

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
