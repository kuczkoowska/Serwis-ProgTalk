const express = require("express");
const topicController = require("../controllers/topic/topicController");
const topicModerationController = require("../controllers/topic/topicModerationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", topicController.createTopic); // Tworzenie
router.get("/", topicController.getAllTopics); // Lista
router.get("/:id", topicController.getTopicDetails); // Szczegóły + podtematy

router.patch("/:topicId/metadata", topicController.updateTopicMetadata);

router.patch("/:topicId/close", topicModerationController.closeTopic);
router.patch("/:topicId/open", topicModerationController.openTopic);
router.patch("/:topicId/hide", topicModerationController.hideTopic);
router.patch("/:topicId/unhide", topicModerationController.unhideTopic);

module.exports = router;
