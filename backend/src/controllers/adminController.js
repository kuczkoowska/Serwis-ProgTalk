const User = require("../models/User");
const Topic = require("../models/Topic");

exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isActive: false, isBlocked: false })
      .select("email username createdAt")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: pendingUsers.length,
      data: { users: pendingUsers },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    if (user.isActive) {
      return res
        .status(400)
        .json({ message: "Ten użytkownik został już zaakceptowany." });
    }

    user.isActive = true;
    await user.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("admins").emit("user_approved", {
        userId: user._id,
        username: user.username,
        approvedBy: req.user.username,
        message: `Użytkownik ${user.username} został zaakceptowany przez ${req.user.username}`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Użytkownik został zaakceptowany.",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    await User.findByIdAndDelete(userId);

    const io = req.app.get("socketio");
    if (io) {
      io.to("admins").emit("user_rejected", {
        username: user.username,
        rejectedBy: req.user.username,
        reason: reason || "Brak powodu",
        message: `Użytkownik ${user.username} został odrzucony przez ${req.user.username}`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Użytkownik został odrzucony i usunięty.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select("email username role isBlocked blockReason createdAt")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Nie możesz zablokować administratora." });
    }

    if (user.isBlocked) {
      return res
        .status(400)
        .json({ message: "Ten użytkownik jest już zablokowany." });
    }

    user.isBlocked = true;
    user.blockReason = reason || "Zablokowany przez administratora";
    await user.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("admins").emit("user_blocked", {
        userId: user._id,
        username: user.username,
        blockedBy: req.user.username,
        reason: user.blockReason,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Użytkownik został zablokowany.",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    if (!user.isBlocked) {
      return res
        .status(400)
        .json({ message: "Ten użytkownik nie jest zablokowany." });
    }

    user.isBlocked = false;
    user.blockReason = null;
    await user.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("admins").emit("user_unblocked", {
        userId: user._id,
        username: user.username,
        unblockedBy: req.user.username,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Użytkownik został odblokowany.",
      data: { user },
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
