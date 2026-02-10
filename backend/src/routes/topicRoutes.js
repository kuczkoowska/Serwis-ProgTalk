const express = require("express");
const topicController = require("../controllers/topic/topicController");
const topicModerationController = require("../controllers/topic/topicModerationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", topicController.createTopic);
router.get("/", topicController.getAllTopics);
router.get("/:id", topicController.getTopicDetails);

router.patch("/:topicId/metadata", topicController.updateTopicMetadata);

router.patch("/:topicId/close", topicModerationController.closeTopic);
router.patch("/:topicId/open", topicModerationController.openTopic);
router.patch("/:topicId/hide", topicModerationController.hideTopic);
router.patch("/:topicId/unhide", topicModerationController.unhideTopic);

module.exports = router;
