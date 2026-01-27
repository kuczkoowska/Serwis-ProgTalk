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

router.post(
  "/:topicId/moderator-applications",
  topicController.createModeratorApplication,
);
router.get(
  "/:topicId/moderator-applications",
  topicController.getModeratorApplications,
);
router.patch(
  "/moderator-applications/:applicationId",
  topicController.reviewModeratorApplication,
);

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
