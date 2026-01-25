const User = require("../models/User");
const { signToken } = require("../utils/jwtHelper");

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.checkPassword(currentPassword))) {
      return res
        .status(401)
        .json({ message: "Twoje obecne hasło jest nieprawidłowe." });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ message: "Nowe hasła nie są identyczne." });
    }

    user.password = newPassword;
    await user.save();

    const token = signToken(user._id);

    res
      .status(200)
      .json({ status: "success", token, message: "Hasło zostało zmienione." });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: false }).select(
      "email username createdAt",
    );

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    // powiadamiam reszte adminów
    const io = req.app.get("socketio");
    if (io) {
      io.to("admins").emit("user_approved", {
        userId: user._id,
        username: user.username,
        message: `Użytkownik ${user.username} został zaakceptowany.`,
      });

      // mail na pocztę - konto jest już aktywne
    }

    res
      .status(200)
      .json({ status: "success", message: "Użytkownik został aktywowany." });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};
