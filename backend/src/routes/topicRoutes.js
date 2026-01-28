const express = require("express");
const topicController = require("../controllers/topicController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", topicController.createTopic); // Tworzenie
router.get("/", topicController.getAllTopics); // Lista
router.get("/:id", topicController.getTopicDetails); // Szczegóły + podtematy

router.patch("/:topicId", topicController.updateTopicMetadata);

router.patch("/:topicId/close", topicController.closeTopic);
router.patch("/:topicId/open", topicController.openTopic);
router.patch(
  "/:topicId/hide",
  authMiddleware.restrictTo("admin"),
  topicController.hideTopic,
);
router.patch(
  "/:topicId/unhide",
  authMiddleware.restrictTo("admin"),
  topicController.unhideTopic,
);

module.exports = router;
