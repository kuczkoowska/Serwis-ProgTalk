const express = require("express");
const userManagementController = require("../controllers/admin/userManagementController");
const systemLogsController = require("../controllers/admin/systemLogsController");
const adminStatsController = require("../controllers/admin/adminStatsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("admin"));

router.get("/stats", adminStatsController.getAdminStats);
router.get("/extended-stats", adminStatsController.getExtendedStats);
router.get("/topics", adminStatsController.getAllTopics);

router.get("/logs", systemLogsController.getSystemLogs);

router.get("/users/pending", userManagementController.getPendingUsers);
router.get("/users", userManagementController.getAllUsers);
router.patch("/users/:userId/approve", userManagementController.approveUser);
router.delete("/users/:userId/reject", userManagementController.rejectUser);
router.patch("/users/:userId/block", userManagementController.blockUser);
router.patch("/users/:userId/unblock", userManagementController.unblockUser);

router.patch(
  "/transfer-ownership/:topicId",
  userManagementController.transferTopicOwnership,
);

module.exports = router;
