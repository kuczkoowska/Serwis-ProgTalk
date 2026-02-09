const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { promisify } = require("util");

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Nie jesteś zalogowany! Zaloguj się, aby uzyskać dostęp.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select(
      "-lastViewedPages",
    );

    if (!currentUser) {
      return res.status(401).json({
        message: "Użytkownik przypisany do tego tokena już nie istnieje.",
      });
    }

    if (currentUser.isBlocked) {
      return res.status(403).json({
        message: "Twoje konto jest zablokowane.",
        reason: currentUser.blockReason,
      });
    }

    if (!currentUser.isActive) {
      return res.status(403).json({
        message:
          "Twoje konto nie zostało jeszcze zaakceptowane przez administratora.",
      });
    }

    req.user = currentUser;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Twój token wygasł. Zaloguj się ponownie." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Nieprawidłowy token." });
    }

    console.error("Błąd w middleware protect:", error);
    return res
      .status(500)
      .json({ message: "Błąd serwera podczas autoryzacji." });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        message:
          "Błąd serwera: Sprawdzanie uprawnień bez wcześniejszej autoryzacji.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Nie masz uprawnień do wykonania tej akcji.",
      });
    }
    next();
  };
};
