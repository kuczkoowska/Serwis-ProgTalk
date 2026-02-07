const express = require("express");
const moderatorController = require("../controllers/moderator/moderatorController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/:topicId/moderators", moderatorController.promoteModerator);
router.post(
  "/:topicId/moderators/revoke",
  moderatorController.takeBackModerator,
);
router.get("/:topicId/blocked-users", moderatorController.getBlockedUsers);
router.post("/:topicId/block", moderatorController.blockUserInTopic);
router.post("/:topicId/unblock", moderatorController.unblockUserInTopic);

module.exports = router;
