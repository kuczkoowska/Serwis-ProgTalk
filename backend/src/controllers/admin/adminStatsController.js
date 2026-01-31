const User = require("../../models/User");
const Topic = require("../../models/Topic");

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const pendingUsers = await User.countDocuments({
      isActive: false,
      isBlocked: false,
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
