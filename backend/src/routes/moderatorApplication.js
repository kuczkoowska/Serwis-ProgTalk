const express = require("express");
const moderatorApplication = require("../controllers/moderator/moderatorApplication");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post(
  "/:topicId/moderator-applications",
  moderatorApplication.createModeratorApplication,
);
router.get(
  "/:topicId/moderator-applications",
  moderatorApplication.getModeratorApplications,
);
router.patch(
  "/moderator-applications/:applicationId",
  moderatorApplication.reviewModeratorApplication,
);

module.exports = router;
