const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("admin"));

router.get("/stats", adminController.getAdminStats);
router.get("/logs", adminController.getSystemLogs);

router.get("/users/pending", adminController.getPendingUsers);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:userId/approve", adminController.approveUser);
router.delete("/users/:userId/reject", adminController.rejectUser);
router.patch("/users/:userId/block", adminController.blockUser);
router.patch("/users/:userId/unblock", adminController.unblockUser);

router.get("/topics", adminController.getAllTopics);

module.exports = router;
