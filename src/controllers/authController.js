const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SystemLogs = require("../models/SystemLogs");
const { ACTION_TYPES } = require("../utils/constants/actionTypes");
const { signToken } = require("../utils/jwtHelper");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { email, username, password, passwordConfirm } = req.body;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Podany email jest nieprawidłowy." });
    }

    if (password != passwordConfirm) {
      return res.status(400).json({ message: "Hasła nie są identyczne" });
    }

    const existingUserEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingUserEmail) {
      return res.status(400).json({ message: "Ten e-mail jest już zajęty" });
    }

    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Użytkownik o podanym loginie już istnieje" });
    }

    const newUser = await User.create({
      email,
      username,
      password,
    });

    const io = req.app.get("socketio");
    if (io) {
      io.to("admins").emit("new_user_registration", {
        email: newUser.email,
        id: newUser._id,
        message: "Nowy użytkownik oczekuje na akceptację",
      });
      console.log(`Wysłano powiadomienie do adminów o: ${newUser.email}`);
    }

    res.status(201).json({
      status: "success",
      message: "Konto zostało utworzone. Czeka na akceptację administratora.",
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const username = req.body?.username;
    const email = req.body?.email;
    const password = req.body?.password;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Podany email jest nieprawidłowy." });
    }

    if (!password || (!email && !username)) {
      return res
        .status(400)
        .json({ message: "Podaj email lub login oraz hasło." });
    }

    const user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Błędne dane logowania" });
    }

    if (!(await user.checkPassword(password))) {
      await SystemLogs.create({
        performerEmailSnapshot: email || username,
        actionType: ACTION_TYPES.LOGIN_FAILED,
      });
      return res.status(401).json({ message: "Nieudana próba logowania" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Twoje konto jest zablokowane.",
        reason: user.blockReason,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Twoje konto oczekuje na akceptację administratora.",
      });
    }

    await SystemLogs.create({
      performer: user._id,
      actionType: "LOGIN_SUCCESS",
      performerEmailSnapshot: user.email,
    });

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
      message: "Użytkownik poprawnie zalogowany",
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
};
