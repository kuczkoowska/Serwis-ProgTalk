const express = require("express");
const topicController = require("../controllers/topicController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", topicController.createTopic); // Tworzenie
router.get("/", topicController.getAllTopics); // Lista
router.get("/:id", topicController.getTopicDetails); // Szczegóły + podtematy

router.post("/:topicId/moderators", topicController.promoteModerator);
router.post("/:topicId/moderators/revoke", topicController.takeBackModerator);
router.post("/:topicId/block", topicController.blockUserInTopic);
router.post("/:topicId/unblock", topicController.unblockUserInTopic);
module.exports = router;
