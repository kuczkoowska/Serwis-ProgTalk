const express = require("express");
const chatController = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/conversations", chatController.getConversations);
router.get("/unread", chatController.getUnreadCount);

router.get("/messages/:recipientId", chatController.getMessages);
router.post("/messages/:recipientId", chatController.sendMessage);

router.patch("/messages/:recipientId/read", chatController.markAsRead);

module.exports = router;
