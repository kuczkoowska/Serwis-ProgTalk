const User = require("../../models/User");
const authService = require("../../services/authorizationService");
const notificationService = require("../../services/notificationService");
const SystemLogs = require("../../models/SystemLogs");
const { ACTION_TYPES } = require("../../utils/constants/actionTypes");

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

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_APPROVE,
      targetUser: user._id,
    });
    notificationService.notifyUserApproved(user, req.user);

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

    await SystemLogs.create({
      performer: req.user._id,
      actionType: ACTION_TYPES.USER_BLOCK_GLOBAL,
      targetUser: user._id,
      reason: user.blockReason,
    });

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
