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

exports.updateProfile = async (req, res) => {
  try {
    const { bio, username } = req.body;

    const user = await User.findById(req.user._id);

    if (req.body.email) {
      return res.status(400).json({
        message: "Adres email nie może być zmieniony.",
      });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          message: "Ta nazwa użytkownika jest już zajęta.",
        });
      }
      user.username = username;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Profil zaktualizowany.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          bio: user.bio,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      status: "success",
      data: { user },
    });
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

exports.saveLastViewedPage = async (req, res) => {
  try {
    const { topicId, page } = req.body;

    if (!topicId || !page) {
      return res.status(400).json({
        message: "topicId i page są wymagane.",
      });
    }

    const user = await User.findById(req.user._id);

    const existingIndex = user.lastViewedPages.findIndex(
      (item) => item.topic.toString() === topicId,
    );

    if (existingIndex !== -1) {
      user.lastViewedPages[existingIndex].page = page;
      user.lastViewedPages[existingIndex].lastVisit = Date.now();
    } else {
      user.lastViewedPages.push({
        topic: topicId,
        page: page,
        lastVisit: Date.now(),
      });
    }

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Ostatnia strona zapisana.",
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.getLastViewedPage = async (req, res) => {
  try {
    const { topicId } = req.params;

    const user = await User.findById(req.user._id);

    const lastViewed = user.lastViewedPages.find(
      (item) => item.topic.toString() === topicId,
    );

    res.status(200).json({
      status: "success",
      data: {
        page: lastViewed ? lastViewed.page : 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.blockUserGlobally = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    user.isBlocked = true;
    user.blockReason = reason || "Brak podanego powodu";
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Użytkownik został zablokowany globalnie.",
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.unblockUserGlobally = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony." });
    }

    user.isBlocked = false;
    user.blockReason = null;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Użytkownik został odblokowany.",
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};
