const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/search", userController.searchUsers);
router.patch("/update-password", userController.updatePassword);
router.patch("/profile", userController.updateProfile);
router.get("/profile", userController.getMyProfile);

router.post("/last-viewed-page", userController.saveLastViewedPage);
router.get("/last-viewed-page/:topicId", userController.getLastViewedPage);

module.exports = router;
