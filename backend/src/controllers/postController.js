const Post = require("../models/Post");
const Topic = require("../models/Topic");
const Tag = require("../models/Tag");
const authService = require("../services/authorizationService");
const notificationService = require("../services/notificationService");
const paginationService = require("../services/paginationService");

exports.createPost = async (req, res) => {
  try {
    const { content, topicId, tags, replyTo } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic)
      return res.status(404).json({ message: "Temat nie znaleziony" });
    if (topic.isClosed)
      return res.status(403).json({ message: "Temat zamknięty" });

    const isBlocked = await authService.isUserBlockedInTopic(
      req.user._id,
      topicId,
    );
    if (isBlocked) {
      return res.status(403).json({
        message: "Jesteś zablokowany w tym temacie",
      });
    }

    let validatedTags = [];
    if (tags && tags.length > 0) {
      const existingTags = await Tag.find({
        _id: { $in: tags },
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
    if (replyTo) {
      await newPost.populate({
        path: "replyTo",
        select: "content author",
        populate: {
          path: "author",
          select: "username",
        },
      });
    }

    notificationService.notifyNewPost(newPost, topicId);

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

    const { page, limit, skip } = paginationService.getPaginationParams(
      req.query,
    );

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Temat nie istnieje." });
    }

    const filter = { topic: topicId };
    if (!authService.isAdmin(req.user)) {
      filter.isDeleted = false;
    }

    const posts = await Post.find(filter)
      .populate("author", "username _id")
      .populate("tags", "name color")
      .populate("replyTo", "content author")
      .sort("createdAt")
      .skip(skip)
      .limit(limit + 1);

    const { items: results, pagination } = paginationService.formatResponse(
      posts,
      page,
      limit,
    );

    res.status(200).json({
      status: "success",
      results: results.length,
      data: { posts: results, hasNextPage: pagination.hasNextPage },
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

    const isBlocked = await authService.isUserBlockedInTopic(
      userId,
      post.topic,
    );
    if (isBlocked) {
      return res.status(403).json({
        message: "Jesteś zablokowany w tym temacie i nie możesz lajkować.",
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    notificationService.notifyPostLiked(
      post._id,
      post.topic,
      post.likes.length,
      !isLiked,
      userId,
    );

    res.status(200).json({
      status: "success",
      message: isLiked ? "Polubienie usunięte" : "Wpis polubiony",
      data: {
        post: post,
      },
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

    const isAdmin = authService.isAdmin(req.user);
    const isAuthor = authService.isOwner(post.author, req.user._id);

    if (!isAdmin && !isAuthor) {
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

    notificationService.notifyPostDeleted(post._id, post.topic, req.user);

    res.status(200).json({
      status: "success",
      message:
        "Wpis został usunięty (nie jest widoczny dla innych użytkowników).",
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};
