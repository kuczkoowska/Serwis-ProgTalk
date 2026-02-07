const User = require("../../models/User");
const Topic = require("../../models/Topic");
const Post = require("../../models/Post");

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const pendingUsers = await User.countDocuments({
      isActive: false,
      isBlocked: false,
      isEmailVerified: true,
    });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalTopics = await Topic.countDocuments();
    const closedTopics = await Topic.countDocuments({ isClosed: true });
    const hiddenTopics = await Topic.countDocuments({ isHidden: true });

    res.status(200).json({
      status: "success",
      data: {
        users: {
          total: totalUsers,
          pending: pendingUsers,
          blocked: blockedUsers,
        },
        topics: {
          total: totalTopics,
          closed: closedTopics,
          hidden: hiddenTopics,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate("creator", "username")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: topics.length,
      data: { topics },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExtendedStats = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularTopicsByPosts = await Post.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$topic", postsCount: { $sum: 1 } } },
      { $sort: { postsCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "_id",
          as: "topic",
        },
      },
      { $unwind: "$topic" },
      {
        $lookup: {
          from: "topics",
          localField: "topic.parent",
          foreignField: "_id",
          as: "parentTopic",
        },
      },
      {
        $project: {
          _id: "$topic._id",
          name: "$topic.name",
          description: "$topic.description",
          postsCount: 1,
          parent: { $arrayElemAt: ["$parentTopic.name", 0] },
          isClosed: "$topic.isClosed",
          isHidden: "$topic.isHidden",
        },
      },
    ]);

    const popularPosts = await Post.aggregate([
      { $match: { isDeleted: false } },
      {
        $project: {
          content: 1,
          author: 1,
          topic: 1,
          likesCount: { $size: "$likes" },
          createdAt: 1,
        },
      },
      { $sort: { likesCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "topics",
          localField: "topic",
          foreignField: "_id",
          as: "topic",
        },
      },
      { $unwind: "$topic" },
      {
        $project: {
          content: { $substr: ["$content", 0, 200] },
          likesCount: 1,
          createdAt: 1,
          "author._id": 1,
          "author.username": 1,
          "topic._id": 1,
          "topic.name": 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        popularTopicsByPosts,
        popularPosts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
