const User = require("../../models/User");
const Topic = require("../../models/Topic");
const authService = require("../../services/authorizationService");
const notificationService = require("../../services/notificationService");
const SystemLogs = require("../../models/SystemLogs");
const { ACTION_TYPES } = require("../../utils/constants/actionTypes");
const emailService = require("../../services/emailService");

exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      isActive: false,
      isBlocked: false,
      isEmailVerified: true,
    })
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

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_APPROVE,
      targetUser: user._id,
    });
    notificationService.notifyUserApproved(user, req.user);
    emailService.sendApprovalEmail(user.email, user.username);

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

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_REJECT,
      performerEmailSnapshot: user.email,
      reason: reason || "Brak powodu",
    });

    await User.findByIdAndDelete(userId);

    notificationService.notifyUserRejected(user.username, req.user, reason);
    emailService.sendRejectionEmail(user.email, user.username, reason);

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

    if (authService.isAdmin(user)) {
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

    const userTopics = await Topic.find({ creator: user._id });

    if (userTopics.length > 0) {
      for (const topic of userTopics) {
        topic.creator = req.user._id;

        await topic.save();

        await SystemLogs.create({
          performer: req.user._id,
          actionType: ACTION_TYPES.TOPIC_TAKEOVER,
          targetTopic: topic._id,
          details: `Przejęcie tematu po zbanowaniu użytkownika ${user.username}`,
        });
      }
    }
    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_BLOCK_GLOBAL,
      targetUser: user._id,
      reason: user.blockReason,
    });

    notificationService.notifyUserBlocked(user, req.user, user.blockReason);

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

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_UNBLOCK_GLOBAL,
      targetUser: user._id,
    });

    notificationService.notifyUserUnblocked(user, req.user);

    res.status(200).json({
      status: "success",
      message: "Użytkownik został odblokowany.",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.transferTopicOwnership = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { newOwnerId } = req.body;

    if (!authService.isAdmin(req.user)) {
      return res.status(403).json({ message: "Brak uprawnień." });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: "Temat nie istnieje" });

    const newOwner = await User.findById(newOwnerId);
    if (!newOwner)
      return res.status(404).json({ message: "Nowy właściciel nie istnieje" });

    const oldOwnerId = topic.creator;
    topic.creator = newOwnerId;

    await topic.save();

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.TOPIC_OWNER_TRANSFER,
      targetTopic: topic._id,
      targetUser: newOwnerId,
      details: `Zmiana właściciela z ${oldOwnerId} na ${newOwnerId}`,
    });

    res.status(200).json({
      status: "success",
      message: "Własność tematu została przeniesiona.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
