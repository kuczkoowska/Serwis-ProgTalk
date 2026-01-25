const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.patch("/update-password", userController.updatePassword);

// admin !!!!
router.use(authMiddleware.restrictTo("admin"));

router.get("/pending", userController.getPendingUsers); // Lista oczekujących
router.patch("/approve/:id", userController.approveUser); // Akceptacja konkretnego uzytkownika

module.exports = router;
