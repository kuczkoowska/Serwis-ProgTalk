const express = require("express");
const moderatorApplication = require("../controllers/moderator/moderatorApplication");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/:topicId", moderatorApplication.createModeratorApplication);
router.get("/:topicId", moderatorApplication.getModeratorApplications);
router.patch(
  "/review/:applicationId",
  moderatorApplication.reviewModeratorApplication,
);

module.exports = router;
