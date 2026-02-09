const User = require("../models/User");
const Topic = require("../models/Topic");
const Post = require("../models/Post");
const { signToken } = require("../utils/jwtHelper");

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    const searchFilter = {
      isActive: true,
      isBlocked: false,
    };

    if (query) {
      searchFilter.$or = [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    const users = await User.find(searchFilter)
      .select("username email avatar role")
      .limit(20)
      .sort("username");

    res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res
        .status(400)
        .json({ status: "fail", message: "Wszystkie pola są wymagane." });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.checkPassword(currentPassword))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Obecne hasło jest nieprawidłowe." });
    }

    if (newPassword !== newPasswordConfirm) {
      return res
        .status(400)
        .json({ status: "fail", message: "Nowe hasła nie są identyczne." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ status: "fail", message: "Hasło musi mieć min. 6 znaków." });
    }

    if (await user.checkPassword(newPassword)) {
      return res.status(400).json({
        status: "fail",
        message: "Nowe hasło nie może być takie samo jak obecne.",
      });
    }

    user.password = newPassword;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      message: "Hasło zostało zmienione.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, username } = req.body;
    const user = await User.findById(req.user._id);

    if (req.body.email && req.body.email !== user.email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Nie można zmienić adresu e-mail." });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: "fail",
          message: "Ta nazwa użytkownika jest już zajęta.",
        });
      }
      user.username = username;
    }

    if (bio !== undefined) {
      if (bio.length > 200) {
        return res
          .status(400)
          .json({ status: "fail", message: "Opis za długi (max 200 znaków)." });
      }
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
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -lastViewedPages",
    );

    const topicsCreated = await Topic.countDocuments({ creator: req.user._id });
    const postsCount = await Post.countDocuments({
      author: req.user._id,
      isDeleted: false,
    });

    const likesReceived = await Post.aggregate([
      { $match: { author: req.user._id, isDeleted: false } },
      { $project: { likesCount: { $size: "$likes" } } },
      { $group: { _id: null, total: { $sum: "$likesCount" } } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        user,
        stats: {
          topics: topicsCreated,
          posts: postsCount,
          likes: likesReceived[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.saveLastViewedPage = async (req, res) => {
  try {
    const { topicId, page } = req.body;
    if (!topicId || !page)
      return res.status(400).json({ status: "fail", message: "Brak danych." });

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

    if (user.lastViewedPages.length > 20) {
      user.lastViewedPages.sort((a, b) => b.lastVisit - a.lastVisit);
      user.lastViewedPages = user.lastViewedPages.slice(0, 20);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: "success", message: "Zapisano." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
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
    res.status(500).json({ status: "error", message: error.message });
  }
};
