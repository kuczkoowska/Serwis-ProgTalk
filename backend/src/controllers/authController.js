const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SystemLogs = require("../models/SystemLogs");
const { ACTION_TYPES } = require("../utils/constants/actionTypes");
const { signToken } = require("../utils/jwtHelper");
const crypto = require("crypto");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { email, username, password, passwordConfirm } = req.body;

    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Podany email jest nieprawidłowy." });
    }
    if (password !== passwordConfirm) {
      return res
        .status(400)
        .json({ status: "fail", message: "Hasła nie są identyczne." });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Użytkownik o takim emailu lub loginie już istnieje.",
      });
    }

    const newUser = new User({
      email,
      username,
      password,
      isEmailVerified: false,
    });

    const verificationToken = newUser.createEmailVerificationToken();

    await newUser.save();

    try {
      await emailService.sendVerificationEmail(
        newUser.email,
        verificationToken,
      );
    } catch (err) {
      console.error("Błąd wysyłania maila (usuwam usera):", err);

      await User.deleteOne({ _id: newUser._id });

      return res.status(500).json({
        status: "error",
        message:
          "Nie udało się wysłać e-maila weryfikacyjnego. Spróbuj ponownie później.",
      });
    }

    notificationService.notifyNewUserRegistration(newUser);

    res.status(201).json({
      status: "success",
      message: "Konto utworzone. Sprawdź swoją skrzynkę mailową.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Błąd serwera podczas rejestracji." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password || (!email && !username)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Podaj email/login oraz hasło." });
    }

    const user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    }).select("+password");

    if (!user || !(await user.checkPassword(password))) {
      if (user) {
        await SystemLogs.create({
          performerEmailSnapshot: email || username,
          actionType: ACTION_TYPES.LOGIN_FAILED,
        });
      }

      return res.status(401).json({
        status: "fail",
        message: "Błędny login lub hasło.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        status: "fail",
        message: "Twoje konto jest zablokowane.",
        reason: user.blockReason,
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        status: "fail",
        message: "Musisz najpierw potwierdzić swój adres e-mail.",
      });
    }

    await SystemLogs.create({
      performer: user._id,
      actionType: ACTION_TYPES.LOGIN_SUCCESS,
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
          isActive: user.isActive,
        },
      },
      message: "Zalogowano pomyślnie.",
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Błąd serwera podczas logowania." });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Link weryfikacyjny jest nieprawidłowy lub wygasł.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({ validateBeforeSave: false });

    await SystemLogs.create({
      performer: user._id,
      actionType: ACTION_TYPES.EMAIL_VERIFIED,
      details: "Email zweryfikowany pomyślnie.",
    });

    res.status(200).json({
      status: "success",
      message:
        "Adres e-mail został zweryfikowany! Czekaj na akceptację administratora.",
    });
  } catch (error) {
    console.error("Verify error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Błąd serwera podczas weryfikacji." });
  }
};
