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
      return res
        .status(404)
        .json({ status: "fail", message: "Temat nie znaleziony" });
    if (topic.isClosed)
      return res
        .status(403)
        .json({ status: "fail", message: "Temat zamknięty" });

    const isBlocked = await authService.isUserBlockedInTopic(
      req.user._id,
      topicId,
    );
    if (isBlocked) {
      return res
        .status(403)
        .json({ status: "fail", message: "Jesteś zablokowany w tym temacie" });
    }

    let validatedTags = [];
    if (tags && tags.length > 0) {
      const existingTags = await Tag.find({ _id: { $in: tags } });
      if (existingTags.length !== tags.length) {
        return res
          .status(400)
          .json({ status: "fail", message: "Niektóre tagi nie istnieją." });
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

    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "username email role avatar")
      .populate("tags", "name color")
      .populate({
        path: "replyTo",
        select: "content author isDeleted",
        populate: { path: "author", select: "username" },
      });

    if (validatedTags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: validatedTags } },
        { $inc: { usageCount: 1 } },
      );
    }

    notificationService.notifyNewPost(topicId, populatedPost);

    res.status(201).json({
      status: "success",
      data: { post: populatedPost },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getPostsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { page, limit, skip } = paginationService.getPaginationParams(
      req.query,
      10,
    );

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res
        .status(404)
        .json({ status: "fail", message: "Temat nie znaleziony." });
    }

    const isAdmin = req.user && authService.isAdmin(req.user);

    const filter = { topic: topicId };

    if (!isAdmin) {
      filter.isDeleted = false;
    }

    const totalPosts = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate("author", "username email role avatar")
      .populate("tags", "name color")
      .populate({
        path: "replyTo",
        select: "content author isDeleted",
        populate: { path: "author", select: "username" },
      })
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit);

    const responseData = paginationService.formatResponse(
      posts,
      page,
      limit,
      totalPosts,
    );

    res.status(200).json({
      status: "success",
      data: {
        posts: responseData.items,
        pagination: responseData.pagination,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getPostPage = async (req, res) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ status: "fail", message: "Post nie istnieje." });
    }

    const isAdmin = req.user && authService.isAdmin(req.user);

    const countFilter = {
      topic: post.topic,
      $or: [
        { createdAt: { $lt: post.createdAt } },
        { createdAt: post.createdAt, _id: { $lt: post._id } },
      ],
    };

    if (!isAdmin) {
      countFilter.isDeleted = false;
    }

    const countBefore = await Post.countDocuments(countFilter);

    const pageNumber = Math.floor(countBefore / limit) + 1;

    res.status(200).json({
      status: "success",
      data: { page: pageNumber, topicId: post.topic },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ status: "fail", message: "Wpis nie istnieje." });

    if (await authService.isUserBlockedInTopic(userId, post.topic)) {
      return res
        .status(403)
        .json({ status: "fail", message: "Nie możesz lajkować (blokada)." });
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
      message: isLiked ? "Cofnięto polubienie" : "Polubiono wpis",
      data: { post },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteOwnPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ status: "fail", message: "Wpis nie znaleziony." });

    const isAdmin = authService.isAdmin(req.user);
    const isAuthor = authService.isOwner(post.author, req.user._id);

    if (!isAdmin && !isAuthor) {
      return res
        .status(403)
        .json({ status: "fail", message: "Brak uprawnień." });
    }

    if (post.isDeleted) {
      return res
        .status(400)
        .json({ status: "fail", message: "Wpis już jest usunięty." });
    }

    post.isDeleted = true;
    post.deletedAt = Date.now();
    await post.save();

    notificationService.notifyPostDeleted(post._id, post.topic, req.user);

    res.status(200).json({
      status: "success",
      message: "Wpis usunięty.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
